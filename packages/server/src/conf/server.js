const port = process.env.SERVER_PORT || 9000;
export default Object.freeze({
    port,
    rootURL: process.env.SERVER_ROOT_URL || `http://localhost:${port}`
});
