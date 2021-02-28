import Koa from 'koa';
import logger from 'koa-pino-logger';
import cors from 'koa-cors';
import createAPI from './api.js';
import mount from 'koa-mount';

export default ({conf}) => {
    return new Koa()
        .use(logger())
        .use(cors())
        .use(mount('/api', createAPI({conf})))
        .use(async (ctx) => ctx.throw(404));
}

