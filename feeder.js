"use strict";

// /seqNo[":\s]+(\w+)/i.exec(s)[1]
// /mesgType[":\s]+(\w+)/i.exec(s)[1]
// /}\s*}\s*$/.exec(s)
// /^{[^{]+({.*})\s*}\*$/.exec(s)[1]

var numeral = require("numeral"),
    moment = require("moment"),
    redis = require("redis"),
    ioredis = require("ioredis"),
    now = moment(),
    filename = "/Users/praphan/Desktop/projects/Redis/md-message1-20160308.log",
    // filename = "/Users/praphan/Desktop/projects/Redis/100lines.json",
    cnt = 0,
    loopsize = 1000,
    datastr = '';

function save_redis(data) {
    var client = redis.createClient("/tmp/redis.sock"),
        m = client.multi(),
        id = cnt - data.length + 1;
    for (var i = 0; i < data.length; i++) {
        var keys = Object.keys(data[i]),
            s = '';
        if (keys.length > 2) {
            s = JSON.stringify(data[i][keys[2]]);
        }
        m.hmset(
            `logs:${id + i}`,
            "seqNo", data[i].seqNo,
            "mesgType", data[i].mesgType,
            "msg", s
        );
    }
    m.exec();
    client.quit();
}

function save_ioredis(data) {
    var client = new ioredis("/tmp/redis.sock"),
        m = client.multi(),
        id = cnt - data.length + 1;
    for (var i = 0; i < data.length; i++) {
        var keys = Object.keys(data[i]),
            s = '';
        if (keys.length > 2) {
            s = JSON.stringify(data[i][keys[2]]);
        }
        m.hmset(
            `logs:${id + i}`,
            "seqNo", data[i].seqNo,
            "mesgType", data[i].mesgType,
            "msg", s
        );
    }
    m.exec();
    client.quit();
}

function process_line_JSONParse(line) {
    if (cnt % loopsize == 1) {
        datastr = '[' + line;
    } else {
        datastr = datastr + ',' + line;
    }
}

function save_JSONParse() {
    save_redis(JSON.parse(datastr + ']'));
}

function load(process_line, save) {
    console.log(moment().format('HH:mm:ss.SSS'));

    require("readline").createInterface({
        input: require("fs").createReadStream(filename)
    }).on("line", function(line) {
        cnt = cnt + 1;
        process_line(line);
        if (cnt % loopsize == 0) {
            // save_ioredis(JSON.parse(datastr + ']'));
            save();
            datastr = null;
        }
    }).on("close", function() {
        if (datastr) {
            save();
        }
        var client = redis.createClient("/tmp/redis.sock");
        client.set('logs:size', cnt);
        client.quit();

        console.log("line = " + numeral(cnt).format());
        console.log("chunk = " + loopsize);
        console.log("time = " + moment(moment().diff(now)).format("mm:ss.SSS"));
        console.log(moment().format('HH:mm:ss.SSS'));
    });

}
// load_JSONParse();
load(process_line_JSONParse, save_JSONParse);
