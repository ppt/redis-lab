var numeral = require('numeral'),
    moment = require('moment'),
    now = moment(),
    filename = '/Users/praphan/Desktop/projects/Redis/md-message1-20160308.log',
    cnt = 0,
    buf, buflen = 30;

require('readline').createInterface({
    input: require('fs').createReadStream(filename)
}).on('line', function(line) {
    cnt = cnt + 1;
    if ((cnt%buflen) == 1) {
        buf = '[' + line;
    } else if ((cnt%buflen) < (buflen-1)) {
        buf = buf + ',' + line;
    } else {
        buf = buf + ',' + line + ']';
        buf = JSON.parse(buf);
    }
}).on('close', function() {
    buf = buf + ']';
    buf = JSON.parse(buf);
    console.log(buflen);
    console.log('line = ' + numeral(cnt).format());
    console.log('time = ' + moment(moment().diff(now)).format('ss.SSS'));
});
