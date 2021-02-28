BEGIN;

INSERT INTO geo.stations(
    station_code,
    label,
    geometry,
    district_code,
    department_code,
    province_code,
    z_coord
)
SELECT
	station_code,
	label,
	ST_Transform(ST_SetSRID(ST_MakePoint(x_coord, y_coord),2154),4326) as geometry, -- we convert lambert 93 projection to WS84
	district_code,
	department_code,
	province_code,
	z_coord
FROM
	raw.stations
WHERE
	projection_type='26' -- we filter to get the land in Europe only (no remote island)
;

INSERT INTO geo.temperature_samples(
    station_code,
    year,
    month,
    avg_temperature
)
SELECT
	station_code,
	extract(year from sample_date::timestamp) as year,
	extract(month from sample_date::timestamp) as month,
	avg(temperature) as avg_temperature
FROM
	raw.temperature_samples
JOIN
	geo.stations USING (station_code)
GROUP BY
    station_code,
    extract(year from sample_date::timestamp),
    extract(month from sample_date::timestamp)
;

WITH voronoi AS (
	SELECT
		(ST_Dump(ST_VoronoiPolygons(ST_Collect(geometry)))).geom as geom
	FROM geo.stations
),
borders AS (
	SELECT
		ST_Union(geometry) as geom
	FROM
		geo.admin_boundaries
),
areas AS (
SELECT
	ST_Intersection(voronoi.geom, borders.geom) as geometry
FROM
	voronoi,
	borders
)


INSERT INTO
	geo.stations_areas(station_code, geometry)
SELECT
	stations.station_code as station_code,
	areas.geometry as geometry
FROM
	areas,
	geo.stations as stations
WHERE
	ST_Intersects(areas.geometry, stations.geometry);

COMMIT;
