/*
 * Copyright (c) 2016 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var http = require('http'),
    httpProxy = require('http-proxy'),
    config = require('./config'),
    logger = require('./utils/logger'),
    confExtractor = require('./configurator/extractor'),
    authManager = require('./auth/oauth2'),
    httpUtils = require('./utils/http-utils'),
    proxy = require('./utils/proxy');

proxy.init();

var proxyConfiguration = confExtractor.getConfiguration();

if (!proxyConfiguration.host || !proxyConfiguration.port) {
    logger.error('No proxy configuration found');
    process.exit(1);
} else {
    logger.info('Using proxy configuration %s : %s', proxyConfiguration.host, proxyConfiguration.port);
}

var forwardProxy = httpProxy.createProxyServer({
    target: proxyConfiguration,
    headers: { host: proxyConfiguration.host },
    web: true
});

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
