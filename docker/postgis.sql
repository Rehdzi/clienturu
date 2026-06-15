
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE addresses ADD COLUMN IF NOT EXISTS geom geography(Point, 4326);

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

CREATE INDEX IF NOT EXISTS addresses_geom_gix ON addresses USING gist (geom);

UPDATE addresses
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE geom IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL;
