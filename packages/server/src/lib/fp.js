export const prop = (propName) => (obj) => obj?.[propName];

export const compose = (fns) => (args) => fns.reduceRight((currentArg, currentFn) => currentFn(currentArg), args);

export const composeP = (fns) => (args) => fns.reduceRight((currentArg, currentFn) => Promise.resolve(currentArg).then(currentFn), args);

export const map = (fn) => (functor) => functor.map(fn);

export const groupBy = (fn) => (items) => items.reduce((acc, curr) => {
    const groupKey = fn(curr);
    const values = acc[groupKey] || [];
    values.push(curr);
    acc[groupKey] = values;
    return acc;
}, {});

export const keyBy = (fn) => (items) => items.reduce((acc, curr) => {
    acc[fn(curr)] = curr;
    return acc;
}, {});

export const mapValues = (fn) => (obj) => Object.fromEntries(
    Object
        .entries(obj)
        .map(([key, value]) => [key, fn(value)])
);
