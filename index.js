#!/usr/bin/env node

const async = require('async');
const Mqtt = require('mqtt');
const Confirm = require('prompt-confirm');
const yargs = require('yargs')
    .option('debug', {
        alias: 'd',
        describe: 'Enable debug messages'
    })
    .option('topic', {
        alias: 't',
        demandOption: true,
        describe: 'MQTT topic, wildcards + and # allowed, may be repeated'
    })
    .option('url', {
        alias: 'u',
        default: 'mqtt://127.0.0.1',
        describe: 'MQTT broker url'
    })
    .option('force', {
        alias: 'f',
        describe: 'Remove topics without confirmation'
    })
    .usage('Usage: $0 <options>')
    .help()
    .version()
    .argv;

if (typeof yargs.topic === 'string') {
    yargs.topic = [yargs.topic];
}

let debug;
const log = console.log;

if (yargs.debug) {
    debug = console.log;
} else {
    debug = () => {};
}

const topics = [];
let wildcard = false;
let subscriptions = 0;
let retainTimer;
let ready = false;

debug('connect', yargs.url);
const mqtt = Mqtt.connect(yargs.url, {
    connectTimeout: 5000
});

function remove(topic, callback) {
    mqtt.publish(topic, '', {retain: true}, err => {
        if (err) {
            console.error('publish error', err.message);
            callback();
        } else {
            log('removed topic', topic);
            callback();
        }
    });
}

function main() {
    const queue = [];
    ready = true;
    log('found', topics.length, 'retained topic' + (topics.length === 1 ? '' : 's'));
    topics.forEach(topic => {
        queue.push(cb => {
            if (yargs.force) {
                remove(topic, cb);
            } else {
                const prompt = new Confirm('really remove ' + topic + ' ?');
                prompt.ask(answer => {
                    if (answer) {
                        remove(topic, cb);
                    } else {
                        cb();
                    }
                });
            }
        });
    });
    async.series(queue, () => {
        setTimeout(() => {
            mqtt.end(false, () => {
                process.exit(0);
            });
        }, 600);
    });
}

function timer() {
    if (!ready) {
        clearTimeout(retainTimer);
        if (!wildcard && topics.length === subscriptions) {
            main();
        } else {
            retainTimer = setTimeout(() => {
                main();
            }, 1200);
        }
    }
}

mqtt.on('connect', () => {
    debug('mqtt connect');
    yargs.topic.forEach(topic => {
        if (topic.match(/[+#]/)) {
            wildcard = true;
        } else {
            subscriptions += 1;
        }
        mqtt.subscribe(topic, err => {
            if (err) {
                console.error('subscribe error', err.message, topic);
            } else {
                debug('subscribed', topic);
            }
        });
    });
    timer();
});

mqtt.on('offline', err => {
    console.error('mqtt connection error', err && err.message);
    process.exit(1);
});

mqtt.on('error', err => {
    console.error('mqtt connection error', err && err.message);
    process.exit(1);
});

mqtt.on('message', (topic, message, packet) => {
    if (packet.retain && !ready) {
        debug('<', topic);
        topics.push(topic);
        timer();
    }
});
