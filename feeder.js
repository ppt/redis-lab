"use strict";

var numeral = require("numeral"),
  moment = require("moment"),
  redis = require("redis"),
  now = moment(),
  filename = "/Users/praphan/Desktop/projects/Redis/md-message1-20160308.log",
  // filename = "/Users/praphan/Desktop/projects/Redis/100lines.json",
  cnt = 0,
  loopsize = 1000,
  data = '';

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

function process_line_JSONParse(line) {
  if (cnt % loopsize == 1) {
    data = '[' + line;
  } else {
    data = data + ',' + line;
  }
}

// /seqNo[":\s]+(\w+)/i.exec(s)[1]
// /mesgType[":\s]+(\w+)/i.exec(s)[1]
// /}\s*}\s*$/.exec(s)
// /^{[^{]+({.*})\s*}\*$/.exec(s)[1]
var r_seqNo = /seqNo[":\s]+(\w+)/i,
  r_mesgType = /mesgType[":\s]+(\w+)/i,
  r_hasmsg = /}\s*}\s*$/,
  r_msg = /^{[^{]+({.*})\s*}\s*$/;

function process_line_regex(line) {
  if (cnt % loopsize == 1) {
    data = [];
  }
  var a = {
    id: cnt,
    seqNo: r_seqNo.exec(line)[1],
    mesgType: r_mesgType.exec(line)[1]
  };
  if (r_hasmsg.exec(line)) {
    a.msg = r_msg.exec(line)[1];
  } else {
    a.msg = '';
  }
  data.push(a);
}

function save_JSONParse() {
  if (data) {
    save_redis(JSON.parse(data + ']'));
    data = null;
  }
}

function save_regex() {
  if (data) {
    var client = redis.createClient("/tmp/redis.sock"),
      m = client.multi();
    for (var i = 0; i < data.length; i++) {
      m.hmset(
        'logs:' + data[i].id,
        "seqNo", data[i].seqNo,
        "mesgType", data[i].mesgType,
        "msg", data[i].msg
      );
    }
    m.exec();
    client.quit();
    data = null;
  }
}

function load(process_line, save) {
  console.log(moment().format('HH:mm:ss.SSS'));

  require("readline").createInterface({
    input: require("fs").createReadStream(filename)
  }).on("line", function(line) {
    cnt = cnt + 1;
    process_line(line);
    if (cnt % loopsize == 0) {
      // save_ioredis(JSON.parse(data + ']'));
      save();
    }
  }).on("close", function() {
    save();
    var client = redis.createClient("/tmp/redis.sock");
    client.set('logs:size', cnt);
    client.quit();

    console.log("line = " + numeral(cnt).format());
    console.log("chunk = " + loopsize);
    console.log("time = " + moment(moment().diff(now)).format("mm:ss.SSS"));
    console.log(moment().format('HH:mm:ss.SSS'));
  });

}

// load(process_line_JSONParse, save_JSONParse);
load(process_line_regex, save_regex);
