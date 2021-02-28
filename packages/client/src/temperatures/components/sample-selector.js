import {buildPath, events} from '../../store.js';

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
    
    #form {
        display: flex;
        flex-direction: column;
    }
    
    label{
        display: flex;
        margin: 0.3rem 0;
    }
    
    label > span:first-child{
        display: inline-block;
        text-align: right;
        width: 60px;
        padding: 0 0.3em;
    }
    
    select{
        flex-grow: 1;
    }
    
    button{
        margin-top: 1em;
    }
`;

// language=HTML
template.innerHTML = `
    <style>${style}</style>
    <form id="form">
        <label>
            <span>Year</span>
            <select name="year" required id="year">
                <option value="2005">2005</option>
                <option value="2006">2006</option>
                <option value="2007">2007</option>
                <option value="2008">2008</option>
                <option value="2009">2009</option>
                <option value="2010">2010</option>
                <option value="2011">2011</option>
                <option value="2012">2012</option>
                <option value="2013">2013</option>
                <option value="2014">2014</option>
                <option value="2015">2015</option>
                <option value="2016">2016</option>
                <option value="2017">2017</option>
                <option value="2018">2018</option>
            </select>
        </label>
        <label>
            <span>Month</span>
            <select name="month" required id="month">
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
            </select>
        </label>
        <button>Load samples</button>
    </form>
`;

export class SampleSelector extends HTMLElement {
    
    static get observedAttributes() {
        return ['year', 'month'];
    }
    
    set year(val) {
        if (val === void 0) {
            this.removeAttribute('year');
        } else {
            this.setAttribute('year', val);
        }
    }
    
    set month(val) {
        if (val === void 0) {
            this.removeAttribute('month');
        } else {
            this.setAttribute('month', val);
        }
    }
    
    get year() {
        return this.hasAttribute('year') ?
            Number(this.getAttribute('year'))
            : void 0;
    }
    
    get month() {
        return this.hasAttribute('month') ?
            Number(this.getAttribute('month'))
            : void 0;
    }
    
    constructor({stationsDB, router}) {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._stationsDB = stationsDB;
        this._router = router;
    }
    
    connectedCallback() {
        this._stationsDB.on(events.SAMPLES_CHANGE_SUCCESS, (ev) => {
            const {month, year} = ev;
            this.month = month;
            this.year = year;
        });
        
        this
            .shadowRoot
            .getElementById('form')
            .addEventListener('submit', ev => {
                const {target: form} = ev;
                const year = form.elements['year'].value;
                const month = form.elements['month'].value;
                this._router.goTo(buildPath({
                    ...this._stationsDB.getCurrentState(),
                    year,
                    month
                }));
                ev.preventDefault();
            });
    }
    
    attributeChangedCallback() {
        this
            .shadowRoot
            .getElementById('year')
            .value = this.year;
        
        this
            .shadowRoot
            .getElementById('month')
            .value = this.month;
    }
}
