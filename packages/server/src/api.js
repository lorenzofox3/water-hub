import Koa from 'koa';
import mount from 'koa-mount';
import {createDatabaseService} from './db.js';
import stationsAPI from './stations/api.js';
import samplesAPI from './samples/api.js';

export default ({conf}) => {
    
    const pool = createDatabaseService(conf.db);
    
    return new Koa()
        .use(mount('/stations', stationsAPI({db: pool})))
        .use(mount('/temperatures', samplesAPI({db: pool})));
};
