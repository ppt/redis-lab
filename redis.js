/* eslint-disable no-unused-vars */
"user strict";

const r = require('redis');
let redis = r.createClient("/tmp/redis.sock");

function multiread() {
    // multiread
    const m = redis.multi();
    m.get("key1");
    m.set("key1", "Hello 555");
    m.get("key2");
    m.get("key3");
    m.exec(function(err, results) {
        if (err) {
            console.log(err);
            return err;
        }
        console.log(results);
    });
    m.exec();
}

function hash() {
    redis.hmset("hash", "k1", "f1", "k2", "f2");
}

function bigloop() {
    const size=5000000,chunk=1000;

    let status,i;
    for (i=1; i<=size; i++) {
        if (i%chunk == 0) {
            redis.quit();
            redis = r.createClient("/tmp/redis.sock");
            console.log(i);
        }
        status = redis.hmset(`logs:${i+1}`,'seqNo',i+1,'mesgType',999,'msg','xxx');
    }
}

bigloop();

redis.quit();
