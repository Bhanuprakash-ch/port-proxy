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
    extractorModule = rewire('../../configurator/extractor'),
    expect = require('expect.js'),
    sinon = require('sinon'),
    utils = require('../../utils/others');

describe('configurator', function() {

    describe('extractor', function() {

        var processMock, configuration;
        beforeEach(function() {
            processMock = {
                env: {
                    PROXY_PORT: 80,
                    PROXY_HOST: 'proxy_host'
                }
            };
            configuration = null;
        });

        it('should return env variables if VCAP_SERVICES not exists', function(done) {
            // prepare
            var expectedResult = {
                host: processMock.env.PROXY_HOST,
                port: processMock.env.PROXY_PORT
            };
            extractorModule.__set__('process', processMock);

            // execute
            configuration = extractorModule.getConfiguration();

            // attest
            expect(Object.keys(configuration)).to.not.equal(0);
            expect(utils.compareObjects(configuration, expectedResult)).to.equal(true);
            done();
        });

    });

});
