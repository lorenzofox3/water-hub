import SQL from 'sql-template-strings';
import {getRowsFromQueryFunction} from '../lib/db.js';
import {compose, composeP, groupBy, keyBy, map, mapValues, prop} from '../lib/fp.js';

export const monthSamples = ({month}) => {
    
    const currentYear = new Date().getFullYear();
    
    return SQL`
WITH month_samples AS (
    SELECT
        *
    FROM
        geo.temperature_samples
    WHERE
        month = ${month}
    -- we add check on year because some data are wrongly reported (0015, 2045)
    AND
        year > 2000
    AND
        year <= ${currentYear}
)
SELECT
    station_code as "stationCode",
    year,
    trunc(round(avg_temperature * 10) / 10, 1) as "avgTemperature",
    trunc(round((avg_temperature - first_value(avg_temperature) OVER station_window) * 10) / 10, 1) AS variation
FROM
    month_samples
WINDOW station_window AS (
    PARTITION BY station_code
    ORDER BY year
)
ORDER BY
    station_code,
    year
;
        `;
};

const keyByYear = keyBy(({year}) => year);

const normalizeSample = ({avgTemperature, variation, ...rest}) => ({
    avgTemperature: avgTemperature === null ? avgTemperature : Number(avgTemperature),
    variation: variation === null ? variation : Number(variation),
    ...rest
});

const omitStationCode = ({stationCode, ...rest}) => ({
    ...rest
});

const omitYear = ({year, ...rest}) => ({
    ...rest
});

const formatStations = compose([
    mapValues(omitYear),
    keyByYear,
    map(omitStationCode)
]);

const format = compose([
    mapValues(formatStations),
    groupBy(prop('stationCode')),
    map(normalizeSample)
]);

export const createService = ({db}) => {
    const fromQuery = getRowsFromQueryFunction({db});
    return {
        monthlyReport: composeP([
            format,
            fromQuery(monthSamples)
        ])
    };
};
