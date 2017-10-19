# mqtt-forget

[![NPM version](https://badge.fury.io/js/mqtt-forget.svg)](http://badge.fury.io/js/mqtt-forget)
[![Dependency Status](https://img.shields.io/gemnasium/hobbyquaker/mqtt-forget.svg?maxAge=2592000)](https://gemnasium.com/github.com/hobbyquaker/mqtt-forget)
[![Build Status](https://travis-ci.org/hobbyquaker/mqtt-forget.svg?branch=master)](https://travis-ci.org/hobbyquaker/mqtt-forget)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![License][mit-badge]][mit-url]

> Command line tool to remove retained MQTT topics by wildcard


## Install

`$ sudo npm install -g mqtt-forget`


## Usage

``` 
Usage: mqtt-forget <Options>

Options:
  -d, --debug  Enable debug messages
  -t, --topic  MQTT topic, wildcards + and # allowed, may be repeated [required]
  -u, --url    MQTT broker url                     [default: "mqtt://127.0.0.1"]
  -f, --force  Remove topics without confirmation
  --help       Show help                                            
  --version    Show version number                                 
```


## Examples

#### Remove all topics matching test/# via websocket connection

`$ mqtt-forget -u ws://websocketbroker -t 'test/#'`


#### Remove all retained topics without confirmation, broker with authentication

`$ mqtt-forget -u mqtt://user:password@broker -t '#' -f`


## Contributing

Pull Requests welcome! :-)


## License

MIT (c) 2017 [Sebastian Raff](https://github.com/hobbyquaker)

[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE
