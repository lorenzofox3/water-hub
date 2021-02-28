import newrelic from '@newrelic/koa';
import {createServer} from 'http';
import createApp from './app.js';
import conf from './conf/index.js';
import logger from './logger.js';

const app = createApp({logger, conf});
const server = createServer(app.callback());

const port = conf.server.port;

server.listen(port, () => {
    logger.info(`server listening on port ${port}`);
});
