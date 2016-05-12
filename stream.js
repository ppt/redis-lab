"use strict";
const numeral = require("numeral"),
    moment = require("moment"),
    fs = require("fs"),
    JSONStream = require("JSONStream"),
    now = moment(),
    // filename = "/Users/praphan/Desktop/projects/Redis/10lines.json";
    filename = "/Users/praphan/Desktop/projects/Redis/md-message1-20160308.log";
let cnt = 0;




console.log(now.format("HH:mm:ss.SSS"));

fs.createReadStream(filename).pipe(JSONStream.parse())
    .on("data", function(data) { 
        cnt += 1;
        // console.log(data);
    })
    .on("close", function() {
        console.log(`line = ${numeral(cnt).format()}
time =${moment(moment().diff(now)).format("mm:ss.SSS")}
`);
        console.log(moment().format("HH:mm:ss.SSS"));
    });
