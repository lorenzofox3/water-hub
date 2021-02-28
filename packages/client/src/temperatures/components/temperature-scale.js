import {events} from '../../store.js';

const template = document.createElement('template');

// language=CSS
const style = `
    :host {
        display: inline-block;
        padding: 0.5em;
    }

    :host([hidden]) {
        display: none;
    }

    #scale {
        display: inline-block;
        opacity: 0.4;
        height: 20px;
        width: 100%;
        background-image: linear-gradient(to right, yellow 0, red 100%);
    }

    #tick-container {
        display: flex;
        justify-content: space-between;
        font-size: 0.8em;
    }
`;

// language=HTML
template.innerHTML = `
    <style>${style}</style>
    <div id="scale"></div>
    <div id="tick-container">
        <span id="min"></span>
        <span id="max"></span>
    </div>
`;

export class TemperatureScale extends HTMLElement {
    
    static get observedAttributes() {
        return ['min', 'max'];
    }
    
    set min(val) {
        if (val === void 0) {
            this.removeAttribute('min');
        } else {
            this.setAttribute('min', val);
        }
    }
    
    set max(val) {
        if (val === void 0) {
            this.removeAttribute('max');
        } else {
            this.setAttribute('max', val);
        }
    }
    
    get min() {
        return this.hasAttribute('min') ?
            Number(this.getAttribute('min'))
            : void 0;
    }
    
    get max() {
        return this.hasAttribute('max') ?
            Number(this.getAttribute('max'))
            : void 0;
    }
    
    constructor({stationsDB}) {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._stationsDB = stationsDB;
    }
    
    connectedCallback() {
        this._stationsDB.on(events.SAMPLES_CHANGE_SUCCESS, () => {
            const [min, max] = this._stationsDB.getTemperatureBoundaries();
            this.min = min;
            this.max = max;
            
            if (this.min === void 0 || this.max === 0) {
                this.setAttribute('hidden', '');
            } else {
                this.removeAttribute('hidden');
            }
            
        });
    }
    
    attributeChangedCallback() {
        this
            .shadowRoot
            .getElementById('min')
            .textContent = `${this.min} °C` || '';
        
        this
            .shadowRoot
            .getElementById('max')
            .textContent = `${this.max} °C` || '';
    }
}
