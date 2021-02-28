import SQL from 'sql-template-strings';
import {getRowsFromQueryFunction} from '../lib/db.js';
import {compose, composeP, groupBy, keyBy, map, mapValues, prop} from '../lib/fp.js';

export const listStationsQuery = () => {
    return SQL`
        SELECT
            station_code AS code,
            label,
            ST_AsGeoJSON(stations.geometry, 6) as location,
            ST_AsGeoJSON(areas.geometry, 6) as area
        FROM
            geo.stations AS stations
        JOIN
            geo.stations_areas AS areas
        USING (station_code);
        `;
};

const normalizeSample = ({avgTemperature, ...rest}) => ({
    avgTemperature: avgTemperature === null ? avgTemperature : Number(avgTemperature),
    ...rest
});

const omitYear = ({year, ...rest}) => ({
    ...rest
});
const omitMonth = ({month, ...rest}) => ({
    ...rest
});
const omitCode = ({code, ...rest}) => ({
    ...rest
});
const groupByYear = groupBy(prop('year'));
const keyByMonth = keyBy(prop('month'));
const keyByCode = keyBy(prop('code'));

const formatYear = compose([
    mapValues(omitMonth),
    keyByMonth,
    map(omitYear)
]);

const formatSamples = compose([
    mapValues(formatYear),
    groupByYear,
    map(normalizeSample)
]);

export const getStationSamplesQuery = ({stationCode}) => {
    
    const currentYear = new Date().getFullYear();
    
    return SQL`
        SELECT
            year,
            month,
            trunc(round(avg_temperature * 10) / 10, 1) as "avgTemperature"
        FROM
            geo.temperature_samples
        WHERE
            station_code = ${stationCode}
        -- we add check on year because some data are wrongly reported (0015, 2045)
        AND
            year > 2000
        AND
            year <= ${currentYear}
        ORDER BY
            year,
            month
    `;
};

const parseGeoJSON = ({location, area, ...rest}) => ({
    ...rest,
    location: JSON.parse(location),
    area: JSON.parse(area)
});

export const createService = ({db}) => {
    const fromQuery = getRowsFromQueryFunction({db});
    return {
        list: composeP([
            mapValues(omitCode),
            keyByCode,
            map(parseGeoJSON),
            fromQuery(listStationsQuery)
        ]),
        getSamples: composeP([
            formatSamples,
            fromQuery(getStationSamplesQuery)
        ])
    };
};
