const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const moment = require('moment');

const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());

server.post('/IRCTC', (req, res) => {

    var source = req.body.result.parameters.source;
    var destination = req.body.result.parameters.destination;
    var date = req.body.result.parameters.date;
    var apiKey = 'ay8dlpzcb6';
    var srcStationCode, destStationCode;

    request('https://api.railwayapi.com/v2/name-to-code/station/'+source+'/apikey/'+apiKey+'/', function(error, responseFromAPI, body) {
  		if (error) {
  			console.log("ERR:", error);
  		} else {
  			var src = JSON.parse(body).stations[0].code;
        srcStationCode = src;
        request('https://api.railwayapi.com/v2/name-to-code/station/'+destination+'/apikey/'+apiKey+'/', function(error, responseFromAPI, body) {
      		if (error) {
      			console.log("ERR:", error);
      		} else {
      			var dest = JSON.parse(body).stations[0].code;
            destStationCode = dest;
            if(srcStationCode && destStationCode) {
              var formattedDate = moment(date).format('DD-MM-YYYY');
              const reqUrl = 'https://api.railwayapi.com/v2/between/source/'+srcStationCode+'/dest/'+destStationCode+'/date/'+formattedDate+'/apikey/'+apiKey+'/';
              request(reqUrl, function(error, responseFromAPI, body) {
            		if (error) {
            			console.log("ERR:", error);
            		} else {
                  var trains = JSON.parse(body).trains;
                  if(trains) {
                    var trainsList = [];
              			for (var i = 0; i < trains.length; i++) {
                      var replacedStr = trains[i].name.replace(/EXP/g, "Express");
                      var trainInfo = replacedStr + ' at ' + trains[i].src_departure_time;
              				trainsList.push(trainInfo);
              			}
                    let dataToSend = "Available trains are " + trainsList.toString();

                    return res.json({
                        speech: dataToSend,
                        displayText: dataToSend,
                        source: 'IRCTC'
                    });
                  } else {
                    return res.json({
                        speech: 'No trains are available',
                        displayText: 'No trains are available',
                        source: 'IRCTC'
                    });
                  }

            		}
              });
            } else {
              return res.json({
                  speech: 'Invalid information',
                  displayText: 'Invalid information',
                  source: 'IRCTC'
              });
            }
      		}
        });
  		}
    });
});

server.listen((process.env.PORT || 8000), () => {
    console.log("Server is up and running...");
});
