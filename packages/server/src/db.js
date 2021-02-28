import pg from 'pg';

export const createDatabaseService = (option) => {
    const pool = new pg.Pool(option);
    return {
        query(...args) {
            return pool.query(...args);
        },
        end() {
            return pool.end();
        }
    };
};
