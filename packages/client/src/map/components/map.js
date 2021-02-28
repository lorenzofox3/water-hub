import {buildPath, events} from '../../store.js';

const template = document.createElement('template');

// language=HTML
template.innerHTML = `
    <mb-geo-map
            center="4,46.657"
            zoom="5"
            mb-style="mapbox://styles/citykleta-dev/cklmbk6nv393u17pgevtasav5"
            access-token="pk.eyJ1IjoiY2l0eWtsZXRhLWRldiIsImEiOiJjanV2ZDNvMDcwMGZqNDNudTQ3OGpkbGpvIn0.8NeW9kCpeupYzgTvwE4eCA"
    >
        <mb-geo-json-source source-id="stations-areas">
            <mb-geo-fill-layer fill-opacity="['case',['==',['get', 'avgTemperature'],null], 0, 0.4]"
                               layer-id="stations-areas-fill">
            </mb-geo-fill-layer>
            <mb-geo-line-layer layer-id="stations-areas-lines" line-color="#a2b2b4" line-width="1">
            </mb-geo-line-layer>
        </mb-geo-json-source>
        <mb-geo-json-source source-id="stations-locations">
            <mb-geo-circle-layer layer-id="stations-circles"
                                 circle-color="#ac62ff"
                                 circle-opacity="['step',['zoom'],0,6,1]"
            ></mb-geo-circle-layer>
        </mb-geo-json-source>
    </mb-geo-map>
`;

export class AppMap extends HTMLElement {
    constructor({stationsDB, router}) {
        super();
        this._stationsDB = stationsDB;
        this._router = router;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    
    connectedCallback() {
        const areaFillLayer = this.shadowRoot.querySelector(`[layer-id=stations-areas-fill]`);
        
        this._stationsDB.on(events.SAMPLES_CHANGE_SUCCESS, this.updateMap.bind(this));
        
        areaFillLayer.addEventListener('click', evt => {
            const {target: map} = evt;
            const features = map.queryRenderedFeatures(evt.point, {
                layers: ['stations-areas-fill']
            });
            const area = features?.[0];
            if (area) {
                this._router.goTo(buildPath({
                    ...this._stationsDB.getCurrentState(),
                    code: area.properties.code
                }));
            }
        });
    }
    
    updateMap() {
        const stationsSource = this.shadowRoot.querySelector(`[source-id=stations-locations]`);
        const stationsAreasSource = this.shadowRoot.querySelector(`[source-id=stations-areas]`);
        const areaFillLayer = this.shadowRoot.querySelector(`[layer-id=stations-areas-fill]`);
        const stationsDB = this._stationsDB;
        
        stationsSource.data = stationsDB.getStationsLocationGeoJSON();
        const temperatureBoundaries = stationsDB.getTemperatureBoundaries();
        
        if (temperatureBoundaries) {
            const [min, max] = temperatureBoundaries;
            stationsAreasSource.data = stationsDB.getStationsAreasGeoJSON();
            areaFillLayer.fillColor = ['interpolate-hcl', ['linear'], ['get', 'avgTemperature'], min, 'yellow', max, 'red'];
        }
    }
}
