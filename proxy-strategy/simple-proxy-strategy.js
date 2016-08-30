var http = require('http'),
    httpProxy = require('http-proxy'),
    config = require('../config'),
    logger = require('../utils/logger');

function listen(options) {
    var forwardProxy = httpProxy.createProxyServer(options);

    var server = http.createServer(function(req, res) {
        forwardProxy.web(req, res);
    });

    logger.info('Listening on port ' + config.server.port);
    server.listen(config.server.port);
}

module.exports = {
    listen: listen
};