-- ============================================================================
-- PostGIS-слой для таблицы addresses.
-- Sequelize создаёт таблицы через sync(), но колонку geom, триггер и GiST-индекс
-- НЕ создаёт (их нет в моделях) — поэтому накатываем их здесь идемпотентно,
-- уже ПОСЛЕ того как backend поднял схему. geom используется в гео-поиске
-- (ST_DWithin / ST_Distance) в organization.service / services.service.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- geography(Point,4326): хранит точку филиала, поддерживается триггером из lat/long
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS geom geography(Point, 4326);

-- Заполняет geom при вставке/обновлении координат
CREATE OR REPLACE FUNCTION addresses_set_geom() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.geom := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS addresses_geom_trg ON addresses;
CREATE TRIGGER addresses_geom_trg
  BEFORE INSERT OR UPDATE OF latitude, longitude ON addresses
  FOR EACH ROW EXECUTE FUNCTION addresses_set_geom();

-- Пространственный индекс для быстрого радиусного поиска
CREATE INDEX IF NOT EXISTS addresses_geom_gix ON addresses USING gist (geom);

-- Бэкфилл geom для строк, у которых есть координаты, но geom пуст
UPDATE addresses
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE geom IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL;
