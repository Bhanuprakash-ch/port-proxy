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
    http = require('http'),
    httpProxy = require('http-proxy');

var listen_port = process.env.PORT || 8080,
    proxy_host, proxy_port;


tryGetConfigFromVcap();
tryGetConfigFromEnv();

if(!proxy_host || !proxy_port) {
    console.error("No proxy configuration found");
    process.exit(1);
} else {
    console.log("Using proxy configuration", proxy_host + ':' + proxy_port);
}


var proxy = httpProxy.createProxyServer({
    target: {
        host: proxy_host,
        port: proxy_port
    },
    web:true
});

var server = http.createServer(function(req, res) {
    proxy.web(req, res);
});

console.log("Listening on port " + listen_port);
server.listen(listen_port);


function tryGetConfigFromVcap() {
    var vcap_services  = JSON.parse(process.env.VCAP_SERVICES || '{}');
    var service = _.first(_.first(_.values(vcap_services)));
    if(!service) {
        console.log("No service bound");
        return;
    }
    var credentials = service.credentials;
    proxy_host = credentials.host || credentials.hostname;
    if(process.env.PROXY_PORT_NAME) {
        proxy_port = credentials.ports[process.env.PROXY_PORT_NAME];
    } else {
        proxy_port = credentials.port;
    }

}

function tryGetConfigFromEnv() {
    if(!proxy_host) {
        proxy_host = process.env.PROXY_HOST;
    }

    if(!proxy_port) {
        proxy_port = process.env.PROXY_PORT;
    }
}
