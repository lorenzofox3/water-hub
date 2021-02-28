import newrelic from 'newrelic';
import pg from 'pg';

export const createDatabaseService = (option) => {
    const pool = new pg.Pool(option);
    return {
        async query(...args) {
            return await newrelic.startSegment('db:query', true, async () => {
                return await pool.query(...args);
            });
        },
        end() {
            return pool.end();
        }
    };
};
