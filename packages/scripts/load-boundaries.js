import {readFileSync} from 'fs'
import {resolve} from 'path';
import pg from 'pg'

const options = {
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432
};
const pool = new pg.Pool(options)

const path = resolve(process.cwd(), '../../db/data/boundaries.json');
const boundaries = JSON.parse(readFileSync(path, {encoding:'utf8'}));

const query = `
INSERT INTO geo.admin_boundaries(code, geometry) VALUES
${
 boundaries.features.map(({properties, geometry}) =>{
     return `('${properties.code}', ST_GeomFromGeoJSON('${JSON.stringify(geometry)}'))`
 }).join(',\n')
}
`

pool
    .query(query)
    .then(() => {
        console.log('boundaries inserted')
        return pool.end()
    });
