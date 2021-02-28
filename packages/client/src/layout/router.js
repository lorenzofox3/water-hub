import {createEventEmitter} from '../utils/events.js';

const noop = () => {
};

export function composeStack(fns = []) {
    const [first, ...rest] = fns;
    
    if (first === void 0) {
        return noop;
    }
    
    const next = composeStack(rest);
    
    return async (ctx) => first(ctx, () => next(ctx));
}

export function createContext({state, router}) {
    return {state, router};
}


export const navigationEvents = {
    ROUTE_CHANGE_START: 'ROUTE_CHANGE_START',
    ROUTE_CHANGE_SUCCESS: 'ROUTE_CHANGE_SUCCESS',
    ROUTE_CHANGE_ERROR: 'ROUTE_CHANGE_END'
};

export const createRouter = ({global = window} = {}) => {
    
    let notFoundHandler;
    const origin = global.location.origin;
    const routes = [];
    
    const service = Object.assign(createEventEmitter(), {
        goTo(path, data = {}) {
            const pathURL = new URL(path, origin);
            const state = {navigation: {URL: pathURL.toString()}, ...data};
            global.history.pushState(state, '', pathURL.href);
            global.dispatchEvent(new PopStateEvent('popstate', {state}));
        },
        redirect(path, data = {}) {
            const pathURL = new URL(path, origin);
            const state = {navigation: {URL: pathURL.toJSON()}, ...data};
            global.history.replaceState(state, '', pathURL.href);
            global.dispatchEvent(new PopStateEvent('popstate', {state}));
        },
        addRoute(pattern, stack = []) {
            routes.push({handler: composeStack([...stack, emitSuccess]), matcher: new RegExp(pattern)});
            return this;
        },
        notFound(fn) {
            notFoundHandler = fn;
            return this;
        }
    });
    
    global.addEventListener('popstate', handlePopState);
    
    return Object.create(service, {
        origin: {value: origin, enumerable: true}
    });
    
    async function handlePopState(ev) {
        try {
            const requestedURL = ev.state?.navigation?.URL ?? origin;
            
            service.emit(navigationEvents.ROUTE_CHANGE_START, {
                requestedURL
            });
            
            const matchingPattern = routes.find(({matcher}) => matcher.test(new URL(requestedURL, origin).pathname));
            
            if (matchingPattern) {
                await matchingPattern.handler(createContext({
                    state: ev.state,
                    router: service
                }));
            } else if (notFoundHandler) {
                await notFoundHandler(createContext({
                    state: ev.state,
                    router: service
                }));
            } else {
                throw new Error('there is no handler for "route not found"');
            }
        } catch (error) {
            service.emit(navigationEvents.ROUTE_CHANGE_ERROR, {
                error
            });
        }
    }
};

export default createRouter();

function emitSuccess(ctx) {
    const {state, router} = ctx;
    router.emit(navigationEvents.ROUTE_CHANGE_SUCCESS, {
        requestedURL: state?.navigation?.URL
    });
}
