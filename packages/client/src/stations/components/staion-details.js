import {buildPath, events} from '../../store.js';

const template = document.createElement('template');

// language=CSS
const style = `
    :host {
        display: inline-block;
    }

    :host([hidden]),
    .hidden {
        display: none;
    }

    header {
        display: flex;
        align-items: center;
    }

    h2 {
        font-size: 1.1em;
        flex-grow: 1;
    }

    .unit {
        font-size: smaller;
    }

    strong {
        font-size: 0.95em;
    }
`;

const dateFormatter = new Intl.DateTimeFormat('en-us', {
    month: 'long',
    year: 'numeric'
});

// language=HTML
template.innerHTML = `
    <style>${style}</style>
    <header>
        <h2 id="title"></h2>
        <button id="close-button">X</button>
    </header>
    <section id="meta">
        <p>
            The average temperature for <strong id="time-frame"></strong> was <strong id="temperature"></strong>
            <span class="unit">°C</span>
        </p>
        <p>This is a raise of <strong id="raise"></strong><span class="unit">°C</span> compared to the first data record
            for the same month</p>
    </section>
    <section id="chart">

    </section>

`;

export class StationDetails extends HTMLElement {
    
    set station(val) {
        const {location, area, ...rest} = val;
        this.shadowRoot
            .getElementById('debug')
            .textContent = JSON.stringify(rest, null, 4);
    }
    
    constructor({
                    stationsDB,
                    router
                }) {
        super();
        this.attachShadow({mode: 'open'});
        const shadowRoot = this.shadowRoot;
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._$ = (id) => shadowRoot.getElementById(id);
        
        this._stationsDB = stationsDB;
        this._router = router;
    }
    
    connectedCallback() {
        const stationsDB = this._stationsDB;
        const router = this._router;
        
        stationsDB.on(events.SAMPLES_CHANGE_SUCCESS, ({code}) => {
            if (!code) {
                this.setAttribute('hidden', '');
            } else {
                this.removeAttribute('hidden');
                this.update();
            }
        });
        
        this.shadowRoot.getElementById('close-button')
            .addEventListener('click', () => {
                const {year, month} = stationsDB.getCurrentState();
                router.goTo(buildPath({
                    year, month
                }));
            });
    }
    
    update() {
        const stationsDB = this._stationsDB;
        const {label, variation, avgTemperature} = stationsDB.getStationDetails();
        const {year, month} = stationsDB.getCurrentState();
        const $ = this._$;
        $('title').textContent = label;
        const hasMeta = avgTemperature !== void 0;
        $('meta').classList.toggle('hidden', !hasMeta);
        const date = new Date(year, month - 1);
        $('time-frame').textContent = dateFormatter.format(date);
        $('temperature').textContent = avgTemperature;
        $('raise').textContent = variation;
        
    }
    
}
