import {composeP, prop} from './fp.js';

const getRows = prop('rows');

export const getRowsFromQueryFunction = ({db}) => (queryFactory) => composeP([
    getRows,
    db.query,
    queryFactory
]);
