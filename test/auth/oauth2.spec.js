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

var rewire = require('rewire'),
    oauthModule = rewire('../../auth/oauth2'),
    expect = require('expect.js'),
    sinon = require('sinon'),
    utils = require('../../utils/others');

describe('auth', function() {

    describe('oauth', function() {

        var vcapMock, requestMock, jwtMock, error, publicKey, token, result;
        beforeEach(function() {
            vcapMock = {
                getAppVcap: sinon.stub().returns({
                    uris: ['port-proxy.gotapaas.eu']
                })
            };

            requestMock = {
                get: sinon.stub()
            };

            jwtMock = {
                verify: sinon.stub()
            };

            error = 'error';
            publicKey = 'public_key';
            token = 'bearer xxxxxx-token-xxxxxx';
            result = 'result';
        });

        it('should not return UAA token if request fails', function() {
            // prepare
            requestMock.get = sinon.stub().callsArgWith(1, error, null, null);
            oauthModule.__set__('vcap', vcapMock);
            oauthModule.__set__('request', requestMock);

            // execute
            return oauthModule.getTokenUaaKey()
                .then(function(){})
                .catch(function(err) {
                    expect(err.message).to.equal(error);
                });
        });

        it('should return UAA token if request is success', function() {
            // prepare
            var response = { statusCode: 200},
                responseBody = '{ "content": "content" }';
            requestMock.get = sinon.stub().callsArgWith(1, null, response, responseBody);
            oauthModule.__set__('vcap', vcapMock);
            oauthModule.__set__('request', requestMock);

            // execute
            return oauthModule.getTokenUaaKey()
                .then(function(result) {
                    expect(result.code).to.equal(response.statusCode);
                });
        });

        it('should not authorize UAA token if token is invalid', function() {
            // prepare
            jwtMock.verify = sinon.stub().callsArgWith(2, error, null);
            oauthModule.__set__('jwt', jwtMock);
            // execute
            return oauthModule.verifyRequestToken(token, publicKey)
                .then(function() {})
                .catch(function(err) {
                    expect(err.error).to.equal(error);
                });
        });

        it('should authorize UAA token if token is valid', function() {
            // prepare
            jwtMock.verify = sinon.stub().callsArgWith(2, null, result);
            oauthModule.__set__('jwt', jwtMock);
            // execute
            return oauthModule.verifyRequestToken(token, publicKey)
                .then(function(result) {
                    expect(result).to.equal(result);
                });
        });

    });

});
