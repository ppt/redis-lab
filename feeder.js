"use strict";

var numeral = require("numeral"),
    moment = require("moment"),
    redis = require("redis"),
    now = moment(),
    filename = "/Users/praphan/Desktop/projects/Redis/md-message1-20160308.log",
    // filename = "/Users/praphan/Desktop/projects/Redis/100lines.json",
    cnt = 0,
    loopsize = 1000,
    datastr = '';

function save(data) {
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

require("readline").createInterface({
    input: require("fs").createReadStream(filename)
}).on("line", function(line) {
    cnt = cnt + 1;

    if (cnt % loopsize == 1) {
        datastr = '[' + line;
    } else {
        datastr = datastr + ',' + line;
    }

    if (cnt % loopsize == 0) {
        save(JSON.parse(datastr + ']'));
        datastr = null;
    }


    // save(data,line);
}).on("close", function() {
    if (datastr) {
        save(JSON.parse(datastr + ']'));
    }
    var client = redis.createClient("/tmp/redis.sock");
    client.set('logs:size', cnt);
    client.quit();

    console.log("line = " + numeral(cnt).format());
    console.log("chunk = " + loopsize);
    console.log("time = " + moment(moment().diff(now)).format("mm:ss.SSS"));
    console.log(moment().format('HH:mm:ss.SSS'));
});

console.log(moment().format('HH:mm:ss.SSS'));
