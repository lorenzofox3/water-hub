import {middleware as validate} from 'koa-json-schema';
import cache from '../middleware/cache-control.js';
import {createApp} from '../lib/app.js';
import {createService} from './service.js';

export default createApp(({router, db}) => {
    const stations = createService({db});
    router.get('/',
        cache(),
        async (ctx) => {
            ctx.body = await stations.list();
        }
    );
    router.get('/:stationCode/temperatures',
        validate({
            type: 'object',
            properties: {
                stationCode: {
                    type: 'string'
                }
            },
            required: ['stationCode']
        }),
        cache(),
        async (ctx) => {
            const {stationCode} = ctx.params;
            ctx.body = await stations.getSamples({
                stationCode
            });
        }
    );
});
