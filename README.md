# port-proxy
This tool allows to proxy traffic between external network and a port hidden inside internal CloudFoundry network. It might be useful for debugging purposes when there is need to connect to a service instance spawned on CF. Note that only HTTP traffic is allowed (as usual in CF).

:warning: **This tool should be used for debugging purposes only and the application should be deleted just after debugging is finished. Notice that not all services are password protected which means that network isolation is the only security mechanism for them. Be aware that by use of this tool may introduce a security hole.**

## Using
Port-proxy accepts 2 kinds of configuration - by service binding or by env variables.

### Passing configuration by service binding

```
cf push <port_proxy_app_name> --no-start
cf bind-service <port_proxy_app_name> <service_to_proxy_name>
cf start <port_proxy_app_name>
```

It is also possible to proxy non-default port (useful for services that expose multiple ports, e.g. InfluxDB)
```cf set-env <port_proxy_app_name> PROXY_PORT_NAME <port_name>```
e.g.:
```cf set-env influx-port-proxy PROXY_PORT_NAME '8083/tcp'```

### Passing configuration by env variables
```
cf push <port_proxy_app_name> --no-start
cf set-env <port_proxy_app_name> PROXY_HOST <hostname>
cf set-env <port_proxy_app_name> PROXY_PORT <port_name>
cf start <port_proxy_app_name>
```

### Turning on authentication layer
Port-proxy is also able to verify access token, which makes it useful as an authentication layer. To turn it on:
```
cf set-env <port_proxy_app_name> AUTH_ENABLED true
cf restart <port_proxy_app_name>
```
From now on, port-proxy expects `Authorization` header with OAuth2 token. Request w/o token or with invalid or expired one is going to result with `401 Unauthorized` error. 

#### Local development
To develop and run port-proxy locally, you need to set additionaly the DOMAIN environment variable which points to the target TAP installation:
```
export DOMAIN=<domain_w/o_"console"_subdomain>
```
