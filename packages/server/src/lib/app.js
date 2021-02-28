import Koa from 'koa';
import Router from 'koa-router';
import conf from '../conf/index.js';

export const createApp = (fn) => (opts = {}) => {
    const app = new Koa();
    const router = new Router();
    fn({...opts, app, router});
    app.use(router.routes());
    return app;
};

export const buildLink = (buildPath) => (arg) => new URL(buildPath(arg), conf.server.rootURL).toString();
