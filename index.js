var express = require('express');
var log4js = require('log4js');
var request = require('request');

var logger = log4js.getLogger('console');
var app = express();
app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO }));

app.get('/', (req, res) => res.send('nothing to see here'));
app.get('/update', (req, res) => {
  var ip = req.header('x-forwarded-for');
  if(ip) {
    ip = ip.split(',')[0];
  } else {
    ip = req.connection.remoteAddress;
  }

  var authToken = process.env.DNSIMPLE_USERNAME + ":" + process.env.DNSIMPLE_TOKEN;
  var domain = process.env.DNSIMPLE_DOMAIN;
  var recordId = process.env.DNSIMPLE_RECORDID;

  var data = {
    record: {
      content: ip,
      ttl: 3600
    }
  };

  request.put({
    url: 'https://api.dnsimple.com/v1/domains/' + domain + '/records/' + recordId,
    json: true,
    body: data,
    headers : {
      "Content-Type": "application/json",
      "X-DNSimple-Token" : authToken
    }
  }, (error, response, body) => {
    if(response.statusCode !== 200){
      logger.error(body);
    } else {
      logger.info('ip changed to ' + ip);
    }
  });

  res.send({ ip: ip });
} );

var port = process.env.PORT || 3000;
app.listen(port, () => logger.info('application listening on port ' + port));
