
BEGIN;

TRUNCATE TABLE
  owner_applications, reviews, bookings, schedules, staff_services,
  organization_staff, services, addresses, organizations,
  user_roles, users, roles
  RESTART IDENTITY CASCADE;

-- общий хеш пароля "password123"
-- $2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy

INSERT INTO roles (id, value, description, "createdAt", "updatedAt") VALUES
  (1, 'Admin', 'Администратор системы', NOW(), NOW()),
  (2, 'User',  'Обычный пользователь (клиент)', NOW(), NOW()),
  (3, 'Staff', 'Мастер / сотрудник организации', NOW(), NOW()),
  (4, 'Owner', 'Владелец организации', NOW(), NOW());

-- id 1: админ; 2-5: владельцы; 6-12: мастера; 13-20: клиенты
INSERT INTO users (id, phone, name, email, password, "createdAt", "updatedAt") VALUES
  (1,  '79990000001', 'Администратор',    'admin@clienturu.ru',   '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (2,  '79990000002', 'Елена Соколова',    'sokolova@lokon.ru',    '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (3,  '79990000003', 'Дмитрий Воронов',   'voronov@borodach.ru',  '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (4,  '79990000004', 'Марина Кузнецова',  'kuznetsova@mindal.ru', '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (5,  '79990000005', 'Артур Гаспарян',    'gasparyan@lotos.ru',   '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (6,  '79990000006', 'Ольга Морозова',    'morozova@lokon.ru',    '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (7,  '79990000007', 'Светлана Белова',   'belova@lokon.ru',      '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (8,  '79990000008', 'Иван Громов',       'gromov@borodach.ru',   '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (9,  '79990000009', 'Пётр Лебедев',      'lebedev@borodach.ru',  '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (10, '79990000010', 'Алина Зайцева',     'zaytseva@mindal.ru',   '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (11, '79990000011', 'Кристина Орлова',   'orlova@mindal.ru',     '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (12, '79990000012', 'Тимур Раджабов',    'radzhabov@lotos.ru',   '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (13, '79991110013', 'Анна Смирнова',     'anna.s@mail.ru',       '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (14, '79991110014', 'Михаил Иванов',     'mikhail.i@mail.ru',    '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (15, '79991110015', 'Екатерина Попова',  'kate.p@mail.ru',       '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (16, '79991110016', 'Сергей Кузьмин',    'sergey.k@mail.ru',     '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (17, '79991110017', 'Наталья Фёдорова',  'natalia.f@mail.ru',    '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (18, '79991110018', 'Алексей Новиков',   'alexey.n@mail.ru',     '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (19, '79991110019', 'Юлия Васильева',    'julia.v@mail.ru',      '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW()),
  (20, '79991110020', 'Роман Соловьёв',    'roman.s@mail.ru',      '$2b$12$z8NDsRSSnaFUnvS59817AeD9AIVsBWZ9JM7mqBd38egFcNvMOCSIy', NOW(), NOW());

INSERT INTO user_roles ("userId", "roleId") VALUES
  (1,1),(1,2),                                  -- админ
  (2,2),(2,4),(3,2),(3,4),(4,2),(4,4),(5,2),(5,4), -- владельцы
  (6,2),(6,3),(7,2),(7,3),(8,2),(8,3),(9,2),(9,3), -- мастера
  (10,2),(10,3),(11,2),(11,3),(12,2),(12,3),
  (13,2),(14,2),(15,2),(16,2),(17,2),(18,2),(19,2),(20,2); -- клиенты

-- rating проставим позже из отзывов; org 4 — на модерации (pending)
INSERT INTO organizations (id, name, email, phone, rating, status, "ownerId", "createdAt", "updatedAt") VALUES
  (1, 'Студия красоты «Локон»', 'info@lokon.ru',    '74951234567', NULL, 'active',  2, NOW(), NOW()),
  (2, 'Барбершоп «Бородач»',    'info@borodach.ru', '74952345678', NULL, 'active',  3, NOW(), NOW()),
  (3, 'Ногтевая студия «Миндаль»','info@mindal.ru', '78123456789', NULL, 'active',  4, NOW(), NOW()),
  (4, 'Спа-салон «Лотос»',      'info@lotos.ru',    '74953456789', NULL, 'pending', 5, NOW(), NOW());

INSERT INTO addresses (id, "organizationId", city, street, label, latitude, longitude, "isPrimary", "createdAt", "updatedAt") VALUES
  (1, 1, 'Москва',          'ул. Тверская, 12',          'Главная студия',   55.7615, 37.6094, true,  NOW(), NOW()),
  (2, 1, 'Москва',          'Ленинский проспект, 45',    'Филиал на Юго-Западе', 55.7045, 37.5805, false, NOW(), NOW()),
  (3, 2, 'Москва',          'Кутузовский проспект, 24',  'Барбершоп «Бородач»', 55.7407, 37.5347, true, NOW(), NOW()),
  (4, 3, 'Санкт-Петербург', 'Невский проспект, 78',      'Студия «Миндаль»',  59.9333, 30.3486, true,  NOW(), NOW()),
  (5, 4, 'Москва',          'ул. Арбат, 15',             'Спа-салон «Лотос»', 55.7494, 37.5917, true,  NOW(), NOW());

INSERT INTO services (id, "organizationId", name, description, price, "durationMinutes", "isActive", "createdAt", "updatedAt") VALUES
  -- Локон (org 1)
  (1, 1, 'Женская стрижка',      'Стрижка любой сложности с мытьём головы', 1500, 60,  true, NOW(), NOW()),
  (2, 1, 'Окрашивание волос',    'Окрашивание в один тон, профессиональные красители', 4500, 120, true, NOW(), NOW()),
  (3, 1, 'Укладка',              'Праздничная или повседневная укладка', 1200, 45,  true, NOW(), NOW()),
  -- Бородач (org 2)
  (4, 2, 'Мужская стрижка',      'Классическая или модельная мужская стрижка', 1200, 45, true, NOW(), NOW()),
  (5, 2, 'Стрижка бороды',       'Моделирование и стрижка бороды', 800, 30, true, NOW(), NOW()),
  (6, 2, 'Бритьё опасной бритвой','Королевское бритьё с горячим полотенцем', 1000, 40, true, NOW(), NOW()),
  -- Миндаль (org 3)
  (7, 3, 'Маникюр с покрытием',  'Аппаратный маникюр + гель-лак', 2000, 90, true, NOW(), NOW()),
  (8, 3, 'Педикюр',              'Классический педикюр с покрытием', 2500, 90, true, NOW(), NOW()),
  (9, 3, 'Наращивание ногтей',   'Наращивание гелем + дизайн', 3000, 120, true, NOW(), NOW()),
  -- Лотос (org 4, на модерации)
  (10, 4, 'Спа-массаж',          'Расслабляющий массаж всего тела, 60 минут', 3500, 60, true, NOW(), NOW()),
  (11, 4, 'Спа-программа «Лотос»','Комплексная программа: пилинг, массаж, обёртывание', 5000, 120, true, NOW(), NOW());

INSERT INTO organization_staff ("organizationId", "userId") VALUES
  (1,6),(1,7),    -- Локон: Морозова, Белова
  (2,8),(2,9),    -- Бородач: Громов, Лебедев
  (3,10),(3,11),  -- Миндаль: Зайцева, Орлова
  (4,12);         -- Лотос: Раджабов

INSERT INTO staff_services ("userId", "serviceId") VALUES
  (6,1),(6,2),(6,3), (7,1),(7,2),(7,3),         -- мастера Локона: все услуги org1
  (8,4),(8,5),(8,6), (9,4),(9,5),(9,6),         -- мастера Бородача
  (10,7),(10,8),(10,9), (11,7),(11,8),(11,9),   -- мастера Миндаля
  (12,10),(12,11);                               -- мастер Лотоса

INSERT INTO schedules ("userId", "organizationId", "dayOfWeek", "startTime", "endTime", "createdAt", "updatedAt")
SELECT u.uid, u.oid, d.dow, '10:00', '20:00', NOW(), NOW()
FROM (VALUES (6,1),(7,1),(8,2),(9,2),(10,3),(11,3),(12,4)) AS u(uid,oid)
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS d(dow);

INSERT INTO bookings (id, "clientId", "organizationId", "serviceId", "masterId", "startTime", "endTime", status, comment, "createdAt", "updatedAt") VALUES
  -- завершённые (прошлое)
  (1, 13, 1, 1, 6, '2026-05-20 09:00:00+00', '2026-05-20 10:00:00+00', 'completed', NULL, NOW(), NOW()),
  (2, 14, 2, 4, 8, '2026-05-22 11:00:00+00', '2026-05-22 11:45:00+00', 'completed', 'Подравнять виски покороче', NOW(), NOW()),
  (3, 15, 3, 7, 10,'2026-05-25 13:00:00+00', '2026-05-25 14:30:00+00', 'completed', NULL, NOW(), NOW()),
  (4, 16, 1, 2, 7, '2026-05-28 12:00:00+00', '2026-05-28 14:00:00+00', 'completed', 'Холодный блонд', NOW(), NOW()),
  (5, 17, 2, 5, 9, '2026-06-01 15:00:00+00', '2026-06-01 15:30:00+00', 'completed', NULL, NOW(), NOW()),
  (6, 18, 3, 8, 11,'2026-06-03 16:00:00+00', '2026-06-03 17:30:00+00', 'completed', NULL, NOW(), NOW()),
  -- отменённая
  (7, 19, 1, 3, 6, '2026-05-30 18:00:00+00', '2026-05-30 18:45:00+00', 'cancelled', 'Не смогу прийти, заболела', NOW(), NOW()),
  -- подтверждённые (будущее)
  (8, 20, 1, 1, 7, '2026-06-10 10:00:00+00', '2026-06-10 11:00:00+00', 'confirmed', NULL, NOW(), NOW()),
  (9, 13, 2, 6, 8, '2026-06-11 14:00:00+00', '2026-06-11 14:40:00+00', 'confirmed', 'Юбилей, хочу выглядеть идеально', NOW(), NOW()),
  (10,14, 3, 9, 10,'2026-06-12 11:00:00+00', '2026-06-12 13:00:00+00', 'confirmed', NULL, NOW(), NOW()),
  -- новые, ожидают подтверждения
  (11,15, 1, 1, 6, '2026-06-15 09:00:00+00', '2026-06-15 10:00:00+00', 'pending', NULL, NOW(), NOW()),
  (12,16, 2, 4, 9, '2026-06-16 13:00:00+00', '2026-06-16 13:45:00+00', 'pending', 'Первый раз у вас', NOW(), NOW());

INSERT INTO reviews (id, "organizationId", "clientId", "bookingId", rating, comment, "createdAt", "updatedAt") VALUES
  (1, 1, 13, 1, 5, 'Отличная стрижка, мастер Ольга — золотые руки! Обязательно вернусь.', NOW(), NOW()),
  (2, 2, 14, 2, 4, 'Хорошая работа, но пришлось немного подождать. В целом доволен.', NOW(), NOW()),
  (3, 3, 15, 3, 5, 'Идеальный маникюр, держится уже третью неделю. Рекомендую!', NOW(), NOW()),
  (4, 1, 16, 4, 5, 'Окрашивание превзошло ожидания, цвет ровный и красивый.', NOW(), NOW()),
  (5, 2, 17, 5, 4, 'Аккуратно подстригли бороду, приду ещё.', NOW(), NOW()),
  (6, 3, 18, 6, 3, 'Педикюр неплохой, но хотелось бы побольше внимания к деталям.', NOW(), NOW());

UPDATE organizations o
SET rating = sub.avg_rating
FROM (SELECT "organizationId", ROUND(AVG(rating)::numeric, 2) AS avg_rating
      FROM reviews GROUP BY "organizationId") sub
WHERE o.id = sub."organizationId";

INSERT INTO owner_applications
  (id, "userId", status, "orgName", "orgPhone", "orgEmail", "addressCity", "addressStreet", "addressLabel", latitude, longitude, comment, "rejectionReason", "reviewedBy", "reviewedAt", "createdAt", "updatedAt") VALUES
  -- на рассмотрении
  (1, 18, 'pending', 'Салон «Шёлк»', '74957778899', 'silk@mail.ru', 'Москва', 'ул. Пятницкая, 7', 'Центральный салон', 55.7415, 37.6280, 'Работаю парикмахером 8 лет, хочу открыть свою студию.', NULL, NULL, NULL, NOW(), NOW()),
  -- одобренная (привела к созданию org 4)
  (2, 5, 'approved', 'Спа-салон «Лотос»', '74953456789', 'info@lotos.ru', 'Москва', 'ул. Арбат, 15', 'Спа-салон «Лотос»', 55.7494, 37.5917, 'Открываем спа-салон премиум-класса.', NULL, 1, '2026-06-05 10:00:00+00', NOW(), NOW()),
  -- отклонённая
  (3, 19, 'rejected', 'Барбершоп «Бритва»', '74951112233', NULL, 'Москва', 'без адреса', NULL, NULL, NULL, 'Хочу открыть барбершоп.', 'Не указан корректный адрес и контактный телефон организации.', 1, '2026-06-06 14:30:00+00', NOW(), NOW());

SELECT setval('roles_id_seq',              (SELECT MAX(id) FROM roles));
SELECT setval('users_id_seq',              (SELECT MAX(id) FROM users));
SELECT setval('organizations_id_seq',      (SELECT MAX(id) FROM organizations));
SELECT setval('addresses_id_seq',          (SELECT MAX(id) FROM addresses));
SELECT setval('services_id_seq',           (SELECT MAX(id) FROM services));
SELECT setval('schedules_id_seq',          (SELECT MAX(id) FROM schedules));
SELECT setval('bookings_id_seq',           (SELECT MAX(id) FROM bookings));
SELECT setval('reviews_id_seq',            (SELECT MAX(id) FROM reviews));
SELECT setval('owner_applications_id_seq', (SELECT MAX(id) FROM owner_applications));

COMMIT;
