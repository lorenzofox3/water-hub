BEGIN;

    CREATE SCHEMA IF NOT EXISTS raw;

    DROP TABLE IF EXISTS raw.stations;

    CREATE TABLE raw.stations(
        station_code VARCHAR,
        label VARCHAR,
        water_hardness NUMERIC,
        x_coord NUMERIC,
        y_coord NUMERIC,
        projection_type VARCHAR,
        projection_label VARCHAR,
        district_code VARCHAR,
        district_name VARCHAR,
        department_code VARCHAR,
        department_name VARCHAR,
        province_code VARCHAR,
        province_name VARCHAR,
        water_mass_code_fr VARCHAR,
        water_mass_code_eu VARCHAR,
        water_mass_name VARCHAR,
        sub_basin_code_dce_eu VARCHAR,
        sub_basin_name_dce_eu VARCHAR,
        basin_code_dce_fr VARCHAR,
        basin_code_dce_eu VARCHAR,
        basin_name_dce VARCHAR,
        stretch_code VARCHAR,
        water_stream_code VARCHAR,
        water_stream_name VARCHAR,
        water_entity_type_code VARCHAR,
        water_entity_type_name VARCHAR,
        comment TEXT,
        creation_date TIMESTAMP,
        stop_date TIMESTAMP,
        updated_date TIMESTAMP,
        station_purpose TEXT,
        station_location VARCHAR,
        station_type_code VARCHAR,
        station_type_name VARCHAR,
        z_coord NUMERIC,
        station_KP NUMERIC,
        first_month_etiage NUMERIC,
        surface_real NUMERIC,
        surface_topographic NUMERIC
    );

COMMIT;

BEGIN;

    DROP TABLE IF EXISTS raw.temperature_samples;

    CREATE TABLE raw.temperature_samples(
        station_code VARCHAR,
        label VARCHAR,
        sample_date VARCHAR,
        sample_time VARCHAR,
        parameter_code VARCHAR,
        parameter_name VARCHAR,
        stretch_code VARCHAR,
        stretch_name VARCHAR,
        temperature NUMERIC,
        unit_code VARCHAR,
        unit_symbol VARCHAR,
        status_code VARCHAR,
        validation_status_code VARCHAR,
        qualification_code VARCHAR,
        qualification_label VARCHAR,
        collection_device VARCHAR,
        collection_device_name VARCHAR
    );

COMMIT;

BEGIN;

    CREATE SCHEMA IF NOT EXISTS geo;

    DROP TABLE IF EXISTS geo.stations CASCADE;

    CREATE TABLE geo.stations(
        station_code VARCHAR PRIMARY KEY,
        label VARCHAR,
        geometry GEOMETRY,
        district_code VARCHAR,
        department_code VARCHAR,
        province_code VARCHAR,
        z_coord NUMERIC
    );

    CREATE INDEX stations_geom_idx
    ON geo.stations
    USING GIST (geometry);

COMMIT;

BEGIN;

    DROP TABLE IF EXISTS geo.temperature_samples;

    CREATE TABLE geo.temperature_samples (
        station_code VARCHAR,
        year integer,
        month integer,
        avg_temperature NUMERIC,
        PRIMARY KEY(station_code, year, month),
        FOREIGN KEY(station_code) REFERENCES geo.stations(station_code)
    );

COMMIT;

BEGIN;

    DROP TABLE IF EXISTS geo.admin_boundaries CASCADE;

    CREATE TABLE geo.admin_boundaries(
        code VARCHAR PRIMARY KEY,
        geometry geometry
    );

    CREATE INDEX boundaries_geom_idx
    ON geo.admin_boundaries
    USING GIST (geometry);

    DROP TABLE IF EXISTS geo.stations_areas;

    CREATE TABLE geo.stations_areas(
        station_code VARCHAR,
        geometry geometry,
        FOREIGN KEY(station_code) REFERENCES geo.stations(station_code)
    );

COMMIT;
