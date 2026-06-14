#!/bin/sh
# ============================================================================
# Одноразовый бутстрап БД (запускается ПОСЛЕ того как backend стал healthy,
# то есть схема уже синхронизирована Sequelize).
#   1. Накатывает идемпотентный PostGIS-слой (geom + триггер + индекс).
#   2. Засевает демонстрационные данные — но только если БД пустая.
# Контейнер отрабатывает и завершается (restart: "no").
# ============================================================================
set -e

export PGPASSWORD="${POSTGRES_PASSWORD:-root}"
PSQL="psql -h ${POSTGRES_HOST:-postgres} -p ${POSTGRES_PORT:-5432} -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-clienturu} -v ON_ERROR_STOP=1"

echo "[db-init] Накатываю PostGIS-слой (geom/триггер/индекс)..."
$PSQL -f /docker/postgis.sql

USERS=$($PSQL -tAc "SELECT count(*) FROM users")
if [ "$USERS" = "0" ]; then
  echo "[db-init] БД пустая — засеваю демо-данные..."
  $PSQL -f /docker/seed.sql
  echo "[db-init] Демо-данные загружены."
else
  echo "[db-init] В users уже $USERS строк — сидинг пропущен."
fi

echo "[db-init] Готово."
