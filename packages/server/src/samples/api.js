import newrelic from 'newrelic';
import {middleware as validate} from 'koa-json-schema';
import cache from '../middleware/cache-control.js';
import {createApp} from '../lib/app.js';
import {createService} from './service.js';

export default createApp(({router, db}) => {
    const samples = createService({db});
    router.get('/',
        validate({
            type: 'object',
            properties: {
                month: {
                    type: 'integer'
                }
            },
            required: ['month']
        }, {
            coerceTypes: true
        }),
        cache(),
        async (ctx, next) => {
            newrelic.addCustomAttribute('month', ctx.query.month);
            return next();
        },
        async (ctx) => {
            const {month} = ctx.query;
            ctx.body = await samples.monthlyReport({month});
        }
    );
});
