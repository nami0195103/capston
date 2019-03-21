var express = require('express');
var app = express();
var fs = require ('fs');
var list = [];

var seq = 0;

app.get('/', function (req, res) {
          res.send('check the temperature:   http://18.216.211.37:8000/dump?count=45');
          });

app.get('/log', function (req, res) {
        fs.appendFile('data.txt', req.query.temp + "\n", (err) => {
                if (err) throw err;
                var string = req.query.temp;
                list.push(string);
                res.end ("res: " + JSON.stringify(req.query));
                console.log(req.query.temp + ' was appended to file!');
                seq++;
        })
});

app.get('/dump', function (req, res) {
        var cnt = req.query.count;
        var msg = ""
        for (var i = 0; i < cnt; i++)
        {
                if (!list[i])
                {
                        msg = msg + "Only " + String(seq) + " data have been uploaded." + "<br>";
                        break;
                }
                msg = msg + list[i] + "<br>";
        }
        res.send (String(msg));
});

app.listen(8000, function () {
  console.log('Example app listening on port 8000!');
});
