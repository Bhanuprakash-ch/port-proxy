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
    logger = require('./utils/logger'),
    confExtractor = require('./configurator/extractor'),
    proxy = require('./utils/proxy'),
    ProxyStrategy = require('./proxy-strategy');

proxy.init();

var proxyConfiguration = confExtractor.getConfiguration();

if (!proxyConfiguration.host || !proxyConfiguration.port) {
    logger.error('No proxy configuration found');
    process.exit(1);
} else {
    logger.info('Using proxy configuration %s : %s', proxyConfiguration.host, proxyConfiguration.port);
}

var proxyOptions = {
    target: proxyConfiguration,
    headers: { host: proxyConfiguration.host },
    web: true
};

var strategyName = (process.env.AUTH_ENABLED || '').toLowerCase() === "true" ? 'authenticated' : 'simple';
new ProxyStrategy(strategyName).listen(proxyOptions);


