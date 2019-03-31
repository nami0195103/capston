var express = require('express');
var app = express();

mysql = require('mysql');
var connection = mysql.createConnection({
        host: 'localhost',
        user: 'me',
        password: 'mypassword',
        database: 'mydb'
})
connection.connect();

function insert_sensor(device, unit, type, value, seq, ip) {
        obj = {};
        obj.seq = seq;
        obj.device = device;
        obj.unit = unit;
        obj.type = type;
        obj.value = value;
        obj.ip = ip.replace(/^.*:/, '');

        var query = connection.query('insert into sensors set ?', obj, function(err, rows, cols) {
                if (err) throw err;
                console.log("INSERTED IN DB= %j", obj);
        });
}

app.get('/graph', function (req, res) {
    console.log('got app.get(graph)');
    var html = fs.readFile('./graph.html', function (err, html) {
    html = " "+ html
    console.log('read file');

    var qstr = 'select * from sensors ';
    connection.query(qstr, function(err, rows, cols) {
      if (err) throw err;

      var data = "";
      var comma = ""
      var start = String(rows[0].time)  //saves when data starts
      for (var i=0; i< rows.length; i++) {
         r = rows[i];
         var time = String(r.time);
         data += comma + "[new Date(2019,02," + time.substring(8, 10) + "," + time.substring(16, 18) + "," + time.substring(19, 21) + "," + time.substring(22, 24) + ")," + r.value +"]"
         comma = ",";
      }
      var header = "data.addColumn('date', 'Date/Time');"
      header += "data.addColumn('number', 'Temp');"
      html = html.replace("<%HEADER%>", header);
      html = html.replace("<%DATA%>", data);

      res.writeHeader(200, {"Content-Type": "text/html"});
      res.write(html);
      res.write('data starts at ' + start + '   , ends at ' + time)
      res.end();
    });
  });
})

app.get('/dump', function (req, res) {  //send saved data to dump page
        var cnt = req.query.count;
        var query = connection.query('select * from sensors order by time desc limit ?', Number(cnt), function(err, rows) {
                if (err) throw err;
                res.end(JSON.stringify(rows));
        });
});

app.get('/log', function (req, res) {   //logging
        r = req.query;
        insert_sensor(r.device, r.unit, r.type, r.value, r.seq, req.connection.remoteAddress);
        res.end('INSERTED: ' + JSON.stringify(req.query));
});

app.get('/', function (req, res) {
          res.end('check the temperature->   http://3.18.106.19:8000/dump?count=45');
});

app.listen(8000, function () {
        console.log('Example app listening on port 8000!');
});
