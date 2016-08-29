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

var _ = require('lodash'),
    logger = require('../utils/logger');

var tryGetConfigFromVcap = function () {
    var vcapServices, service, credentials, proxyHost, proxyPort;
    vcapServices = JSON.parse(process.env.VCAP_SERVICES || '{}');
    service = _.first(_.first(_.values(vcapServices)));
    if (!service) {
        logger.info('No service bound');
        return;
    }
    credentials = service.credentials;
    proxyHost = credentials.host || credentials.hostname;
    if (process.env.PROXY_PORT_NAME) {
        proxyPort = credentials.ports[process.env.PROXY_PORT_NAME];
    } else {
        proxyPort = credentials.port;
    }

    return {
        host: proxyHost,
        port: proxyPort
    }
};

var tryGetConfigFromEnv = function () {
    return {
        host: process.env.PROXY_HOST,
        port: process.env.PROXY_PORT
    };
};

module.exports.getConfiguration = function () {
    return tryGetConfigFromVcap() || tryGetConfigFromEnv();
};
