import {CircleLayer, FillLayer, GeoJSONSource, GeoMap, LineLayer} from '@citykleta/mb-gl-comp';
import stationsAPI from './stations/http.js';
import temperaturesAPI from './temperatures/http.js';
import {StationDetails} from './stations/components/staion-details.js';
import {buildPath, createStore, events} from './store.js';
import {TemperatureScale} from './temperatures/components/temperature-scale.js';
import router from './layout/router.js';
import {AppMap} from './map/components/map.js';
import {SampleSelector} from './temperatures/components/sample-selector.js';
import routeHandler from './temperatures/handler.js';

// map components
customElements.define('mb-geo-map', GeoMap);
customElements.define('mb-geo-json-source', GeoJSONSource);
customElements.define('mb-geo-fill-layer', FillLayer);
customElements.define('mb-geo-line-layer', LineLayer);
customElements.define('mb-geo-circle-layer', CircleLayer);

// services
const stationsDB = createStore({
    stationsAPI,
    temperaturesAPI
});
stationsDB.on(events.SAMPLES_CHANGE_ERROR, console.error);

const serviceRegistry = {
    stationsDB,
    stationsAPI,
    temperaturesAPI,
    router
};

// app components
const define = (tag, Comp) => customElements.define(tag, class extends Comp {
    constructor() {
        super(serviceRegistry);
    }
});

define('app-temperature-scale', TemperatureScale);
define('app-map', AppMap);
define('app-sample-selector', SampleSelector);
define('app-station-details', StationDetails);

// router definition
router
    .addRoute('\\d{4}/\\d{1,2}', [
        routeHandler({stationsDB})
    ])
    .notFound(() => {
        router.redirect(buildPath({
            year: 2011,
            month: 2
        }));
    });

// boot app
router.goTo(window.location.href);

