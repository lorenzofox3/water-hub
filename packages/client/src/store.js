import {stationAreasToGeoJSON, stationLocationsToGeoJSON} from './map/geo.js';
import {createEventEmitter} from './utils/events.js';

const listTemperatures = ({samples = {}, year}) => Object
    .values(samples)
    .map((stationSamples) => stationSamples?.[year]?.avgTemperature ?? null)
    .filter(Boolean);

export const events = {
    SAMPLES_CHANGE_SUCCESS: 'SAMPLE_CHANGE_SUCCESS',
    SAMPLES_CHANGE_ERROR: 'SAMPLE_CHANGE_ERROR',
    SAMPLES_CHANGE_START: 'SAMPLE_CHANGE_START'
};

const EMPTY_DB = Object.freeze({});

export const buildPath = ({year, month, code}) => `${year}/${month}` + (code ? `?station=${code}` : '');

export const createStore = ({stationsAPI, temperaturesAPI}) => {
    
    let stations = EMPTY_DB;
    let currentYear;
    let currentMonth;
    let currentStationCode;
    let samples;
    
    return Object.assign(createEventEmitter(), {
        async useSamples({year, month, code}) {
            try {
                this.emit(events.SAMPLES_CHANGE_START, {
                    year,
                    month,
                    code
                });
                
                if (EMPTY_DB === stations) {
                    stations = await stationsAPI.fetchAll();
                }
                
                samples = await temperaturesAPI.fetch({month});
                currentYear = year;
                currentMonth = month;
                currentStationCode = code;
                this.emit(events.SAMPLES_CHANGE_SUCCESS, {
                    year,
                    month,
                    code
                });
            } catch (error) {
                this.emit(events.SAMPLES_CHANGE_ERROR, {
                    error
                });
            }
        },
        getStationDetails() {
            const base = stations?.[currentStationCode];
            return {
                ...base,
                ...samples?.[currentStationCode]?.[currentYear] ?? {}
            };
        },
        getTemperatureBoundaries() {
            const list = listTemperatures({year: currentYear, samples});
            if (!list.length) {
                return [];
            }
            return [Math.min(...list), Math.max(...list)];
        },
        getStationsLocationGeoJSON() {
            return stationLocationsToGeoJSON(Object
                .entries(stations)
                .map(([code, value]) => ({
                    code,
                    ...value
                }))
            );
        },
        getStationsAreasGeoJSON() {
            return stationAreasToGeoJSON(Object
                .entries(stations)
                .map(([code, {label, area}]) => ({
                    code,
                    label,
                    area,
                    avgTemperature: samples?.[code]?.[currentYear]?.avgTemperature ?? null
                })));
        },
        getCurrentState() {
            return {
                year: currentYear,
                month: currentMonth,
                code: currentStationCode
            };
        }
    });
};
