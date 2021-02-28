/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    routes: [
        {'match': 'routes', 'src': '.*', 'dest': './index.html'}
    ]
};
