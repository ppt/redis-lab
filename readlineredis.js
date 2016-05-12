"use strict";

var numeral = require("numeral"),
    redis = require("redis"),
    moment = require("moment"),
    now = moment(),
    filename = "/Users/praphan/Desktop/projects/Redis/md-message1-20160308.log",
    // filename = "/Users/praphan/Desktop/projects/Redis/100lines.json",
    cnt = 0,
    loopsize = 300,
    buf = [],
    datastr = '';

function save() {
    var client = redis.createClient("/tmp/redis.sock"),
        m = client.multi(),
        data = JSON.parse(datastr + ']'),
        id = cnt - data.length + 1;
    for (var i = 0; i < data.length; i++) {
        m.hmset(
            `logs:${id + i}`,
            "seqNo", data[i].seqNo,
            "mesgType", data[i].mesgType,
            "msg", buf[i]
        );
    }
    m.exec();
    client.quit();
}

require("readline").createInterface({
    input: require("fs").createReadStream(filename)
}).on("line", function(line) {
    cnt = cnt + 1;
    buf.push(line);

    if (cnt % loopsize == 1) {
        datastr = '[' + line;
    } else {
        datastr = datastr + ',' + line;
    }

    if (cnt % loopsize == 0) {
        // JSON.parse(datastr+']');
        save();
        buf = [];
    }


    // save(data,line);
}).on("close", function() {
    if (buf.length > 0) {
        save();
    }

    console.log("line = " + numeral(cnt).format());
    console.log("chunk = " + loopsize);
    console.log("time = " + moment(moment().diff(now)).format("mm:ss.SSS"));
    console.log(moment().format('HH:mm:ss.SSS'));
});

console.log(moment().format('HH:mm:ss.SSS'));
