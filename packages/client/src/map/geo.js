export const stationLocationsToGeoJSON = (stations = []) => ({
    type: 'FeatureCollection',
    features: stations.map(({code, label, location}) => ({
        type: 'Feature',
        properties: {
            code,
            label
        },
        geometry: location
    }))
});

export const stationAreasToGeoJSON = (stations = []) => ({
    type: 'FeatureCollection',
    features: stations.map(({area, ...properties}) => ({
        type: 'Feature',
        properties,
        geometry: area
    }))
})
