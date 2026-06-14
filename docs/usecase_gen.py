#!/usr/bin/env python3
"""Generate a UML Use-Case diagram (SVG, landscape) for the Clienturu project."""
import html

W, H = 2000, 1180
parts = []

def esc(s): return html.escape(s)

parts.append(
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
    f'viewBox="0 0 {W} {H}" font-family="DejaVu Sans, Arial, sans-serif">'
)
parts.append(f'<rect x="0" y="0" width="{W}" height="{H}" fill="#ffffff"/>')

parts.append('<style>'
    '.uc{fill:#eef4ff;stroke:#3b6fb5;stroke-width:1.6;}'
    '.uca{fill:#fff4e6;stroke:#cc7a1a;stroke-width:1.6;}'   # admin
    '.uco{fill:#eafaf0;stroke:#2e8b57;stroke-width:1.6;}'   # owner
    '.ucs{fill:#f5ecfb;stroke:#7a4fb5;stroke-width:1.6;}'   # staff/master
    '.ucp{fill:#f3f3f3;stroke:#888;stroke-width:1.6;}'      # public/guest
    '.lbl{font-size:14px;fill:#15233a;text-anchor:middle;}'
    '.actor{font-size:16px;font-weight:bold;fill:#15233a;text-anchor:middle;}'
    '.title{font-size:30px;font-weight:bold;fill:#15233a;text-anchor:middle;}'
    '.sys{font-size:18px;font-weight:bold;fill:#5a6b85;text-anchor:middle;}'
    '.line{stroke:#7d8aa0;stroke-width:1.3;fill:none;}'
    '</style>')

parts.append(f'<text x="{W/2}" y="48" class="title">Диаграмма вариантов использования — Clienturu</text>')

# ---- system boundary ----
BX, BY, BW, BH = 360, 100, 1280, 1020
parts.append(f'<rect x="{BX}" y="{BY}" width="{BW}" height="{BH}" rx="14" '
             f'fill="none" stroke="#5a6b85" stroke-width="2"/>')
parts.append(f'<text x="{BX+BW/2}" y="{BY+28}" class="sys">Система онлайн-записи «Clienturu»</text>')

ovals = {}

def actor(x, y, name, aid):
    parts.append(f'<g stroke="#15233a" stroke-width="2" fill="none">'
                 f'<circle cx="{x}" cy="{y}" r="13"/>'
                 f'<line x1="{x}" y1="{y+13}" x2="{x}" y2="{y+48}"/>'
                 f'<line x1="{x-22}" y1="{y+26}" x2="{x+22}" y2="{y+26}"/>'
                 f'<line x1="{x}" y1="{y+48}" x2="{x-18}" y2="{y+78}"/>'
                 f'<line x1="{x}" y1="{y+48}" x2="{x+18}" y2="{y+78}"/>'
                 f'</g>')
    for i, ln in enumerate(name.split('\n')):
        parts.append(f'<text x="{x}" y="{y+98+i*18}" class="actor">{esc(ln)}</text>')
    ovals[aid] = (x, y, 0, 0)

def usecase(cx, cy, text, aid, cls="uc", w=210):
    rx, ry = w/2, 34
    parts.append(f'<ellipse class="{cls}" cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}"/>')
    words, lines, cur = text.split(' '), [], ''
    for wd in words:
        if len(cur) + len(wd) + 1 > 26:
            lines.append(cur); cur = wd
        else:
            cur = (cur + ' ' + wd).strip()
    if cur: lines.append(cur)
    start = cy - (len(lines)-1)*8
    for i, ln in enumerate(lines):
        parts.append(f'<text x="{cx}" y="{start+i*16+5}" class="lbl">{esc(ln)}</text>')
    ovals[aid] = (cx, cy, rx, ry)

def assoc(actor_id, uc_id):
    ax, ay = ovals[actor_id][0], ovals[actor_id][1]
    ux, uy, rx, ry = ovals[uc_id]
    ay2 = ay + 26
    ex = ux - rx if ux > ax else ux + rx
    parts.append(f'<line class="line" x1="{ax + (22 if ux>ax else -22)}" y1="{ay2}" '
                 f'x2="{ex}" y2="{uy}"/>')

# ================= ACTORS =================
actor(150, 300,  'Гость', 'guest')
actor(150, 560,  'Клиент', 'client')
actor(150, 850,  'Мастер\n(сотрудник)', 'master')
actor(1850, 360, 'Владелец', 'owner')
actor(1850, 930, 'Админи-\nстратор', 'admin')

# ================= USE CASES (4 columns) =================
C1, C2, C3, C4 = 560, 850, 1170, 1460

# --- Public (Гость) -> C1 top ---
usecase(C1, 185, 'Просмотр каталога организаций', 'uc_catalog', 'ucp')
usecase(C1, 270, 'Просмотр организации, услуг и отзывов', 'uc_org', 'ucp')
usecase(C1, 355, 'Просмотр свободных слотов', 'uc_slots', 'ucp')
usecase(C1, 440, 'Регистрация', 'uc_reg', 'ucp')
usecase(C1, 525, 'Вход в систему', 'uc_login', 'ucp')

# --- Master -> C1 bottom ---
usecase(C1, 770, 'Просмотр своего расписания', 'uc_sched', 'ucs')
usecase(C1, 860, 'Просмотр назначенных записей', 'uc_mbook', 'ucs')
usecase(C1, 950, 'Подтверждение / завершение записи', 'uc_status', 'ucs')

# --- Client -> C2 ---
usecase(C2, 230, 'Бронирование услуги', 'uc_book', 'uc')
usecase(C2, 330, 'Просмотр своих записей', 'uc_mybook', 'uc')
usecase(C2, 430, 'Отмена своей записи', 'uc_cancel', 'uc')
usecase(C2, 530, 'Оставить / удалить отзыв', 'uc_review', 'uc')
usecase(C2, 630, 'Подать заявку на роль владельца', 'uc_apply', 'uc')
usecase(C2, 730, 'Настройки профиля', 'uc_settings', 'uc')

# --- Owner -> C3 + C4 top ---
usecase(C3, 210, 'Создание и управление организацией', 'uc_oorg', 'uco')
usecase(C3, 320, 'Подача организации на модерацию', 'uc_omod', 'uco')
usecase(C3, 430, 'Управление услугами', 'uc_osvc', 'uco')
usecase(C3, 540, 'Управление адресами', 'uc_oaddr', 'uco')
usecase(C4, 210, 'Управление персоналом', 'uc_ostaff', 'uco')
usecase(C4, 320, 'Назначение услуг мастеру', 'uc_oassign', 'uco')
usecase(C4, 430, 'Настройка расписания мастера', 'uc_osched', 'uco')
usecase(C4, 540, 'Просмотр записей и календаря организации', 'uc_ocal', 'uco')

# --- Admin -> C4 bottom ---
usecase(C4, 770,  'Управление пользователями', 'uc_ausers', 'uca')
usecase(C4, 870,  'Модерация организаций (одобрить / отклонить)', 'uc_aorg', 'uca')
usecase(C4, 980,  'Рассмотрение заявок владельцев', 'uc_aapp', 'uca')
usecase(C4, 1080, 'Управление ролями', 'uc_aroles', 'uca')

# ================= ASSOCIATIONS =================
for u in ['uc_catalog','uc_org','uc_slots','uc_reg','uc_login']:
    assoc('guest', u)
for u in ['uc_book','uc_mybook','uc_cancel','uc_review','uc_apply','uc_settings']:
    assoc('client', u)
for u in ['uc_sched','uc_mbook','uc_status']:
    assoc('master', u)
for u in ['uc_oorg','uc_omod','uc_osvc','uc_oaddr','uc_ostaff','uc_oassign','uc_osched','uc_ocal']:
    assoc('owner', u)
for u in ['uc_ausers','uc_aorg','uc_aapp','uc_aroles']:
    assoc('admin', u)

# ---- legend ----
ly = H - 28
legend = [('ucp','Публичные'),('uc','Клиент'),('ucs','Мастер'),('uco','Владелец'),('uca','Админ')]
lx = 700
for cls, name in legend:
    parts.append(f'<rect class="{cls}" x="{lx}" y="{ly-14}" width="26" height="18" rx="4"/>')
    parts.append(f'<text x="{lx+34}" y="{ly}" font-size="15" fill="#15233a">{esc(name)}</text>')
    lx += 130

parts.append('</svg>')

with open('docs/usecase.svg', 'w', encoding='utf-8') as f:
    f.write('\n'.join(parts))
print('written docs/usecase.svg')
