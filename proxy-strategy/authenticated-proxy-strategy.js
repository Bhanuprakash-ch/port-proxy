var http = require('http'),
    httpProxy = require('http-proxy'),
    config = require('../config'),
    logger = require('../utils/logger'),
    authManager = require('../auth/oauth2'),
    httpUtils = require('../utils/http-utils');

function listen(options) {
    var forwardProxy = httpProxy.createProxyServer(options);

    authManager.getTokenUaaKey()
        .then(function (response) {
            var UAA_PUBLIC_KEY = response.body.value;
            logger.info('Public key has been retrieved from UAA');
            var server = http.createServer(function (req, res) {
                var token = req.headers.authorization || req.headers.Authorization;
                if (!token) {
                    logger.debug('Missing token, request cannot be forwarded.');
                    httpUtils.sendHttpResponse(httpUtils.responses.error.Unauthorized.code,
                        {'Content-Type': 'text/plain'}, httpUtils.responses.error.Unauthorized.message, res);
                    return;
                }
                authManager.verifyRequestToken(token, UAA_PUBLIC_KEY)
                    .then(function () {
                        logger.debug('Token verified, request has been forwarded.');
                        forwardProxy.web(req, res);
                    })
                    .catch(function (err) {
                        logger.debug('Request cannot be forwarded: ', err);
                        httpUtils.sendHttpResponse(err.code || httpUtils.responses.error.InternalServerError.code,
                            {'Content-Type': 'application/json'}, err.message || err, res);
                    });
            });
            logger.info('Listening on port ' + config.server.port);
            server.listen(config.server.port);
        })
        .catch(function (err) {
            logger.error('Cannot to retrieve public key from UAA.');
            throw err;
        });
}

module.exports = {
    listen: listen
}