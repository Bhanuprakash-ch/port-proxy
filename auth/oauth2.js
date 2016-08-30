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

'use strict';

var request = require('request'),
    Q = require('q'),
    logger = require('../utils/logger'),
    httpUtils = require('../utils/http-utils'),
    jwt = require('jsonwebtoken'),
    domainParser = require('domain-name-parser'),
    vcap = require('../configurator/vcap');

var getAppDomain = function() {
    if(process.env.DOMAIN) {
        return process.env.DOMAIN;
    }
    var appUris = vcap.getAppVcap().uris;
    if(appUris) {
        var appUrl = appUris[0];
        return domainParser(appUrl).domain;
    } else {
        logger.error('Cannot extract APP uri.');
        throw 'Cannot extract APP uri.';
    }
};

var DOMAIN = getAppDomain();
var UAA_TOKEN_KEY_ENDPOINT = 'http://uaa.' + DOMAIN + '/token_key';

module.exports.getTokenUaaKey = function() {
    logger.debug('Getting uaa token key.');
    return Q.Promise(function (resolve, reject) {
        request.get({
            url: UAA_TOKEN_KEY_ENDPOINT
        }, function(err, response, body) {
            if(!err) {
                resolve({
                    code: response.statusCode,
                    body: JSON.parse(body)
                });
            } else {
                reject({
                    code: httpUtils.responses.error.InternalServerError.code,
                    message: err
                });
            }
        });
    });
};

var removeBearerPrefix = function (token) {
    return token.replace(/^bearer /i, '');
};

module.exports.verifyRequestToken = function(token, publicKey) {
    logger.debug('Token verification.');
    var preparedToken = removeBearerPrefix(token);
    return Q.Promise(function (resolve, reject) {
        jwt.verify(preparedToken, publicKey, function(err, decoded) {
            if(err) {
                reject({
                    code: httpUtils.responses.error.Unauthorized.code,
                    message: httpUtils.responses.error.Unauthorized.message,
                    error: err
                });
            }
            resolve(decoded);
        });
    });
};
