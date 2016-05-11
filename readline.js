'use strict';
const numeral = require('numeral'),
    moment = require('moment'),
    readline = require('readline'),
    now = moment(),
    filename = '/Users/praphan/Desktop/projects/Redis/md-message1-20160308.log';
let cnt = 0,
    buf;

readline.createInterface({
    input: require('fs').createReadStream(filename)
}).on('line', function(line) {
    cnt = cnt + 1;
    buf = JSON.parse(line);
}).on('close', function() {
    console.log(`${buf}
line = ${numeral(cnt).format()}
time = ${moment(moment().diff(now)).format('mm:ss.SSS')}`);
});
