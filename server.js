var express = require("express");
var app = express();
var request = require("request");
var symbols = ["fb","aapl"];

var server = app.listen(process.env.PORT || 3000);
var io = require("socket.io")(server);

app.use(express.static("public"));
app.set("views", "./views");
app.set("view engine","ejs");

io.on("connection", function(socket){
    console.log(socket.id);
    socket.on("add", function(data){
        if(data == "") return;
        for (var i = 0; i <symbols.length; i++) {
            if(symbols[i] == data) symbols.splice(i,1);
        }
        symbols.push(data);
        console.log(symbols.toString());
        const url = "https://api.iextrading.com/1.0/stock/market/batch?symbols=" 
        + symbols.toString() + "&types=chart";
        
        request(url,function(err,data){
            if(err) throw err;
            var result = JSON.parse(data.body);
            var dataset = [];
            var labels = [];
            for (var i = 0; i < symbols.length; i ++) {
                var data = [];
                var key = symbols[i].toUpperCase();
                console.log(key);
                for(var x = 0; x < result[key].chart.length; x++) {
                    data.push(result[key].chart[x].close);
                    if (i<1) labels.push(result[key].chart[x].date);
                }
                dataset[i] = {
                    label: key,
                    data: data,
                    borderColor: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
                    borderJoinStyle: "miter",
                }
            }
            io.sockets.emit("serverSentData", [labels,dataset]);
        })
    })
    socket.on("remove", function(data){
        for(var i = 0; i < symbols.length; i++) {
            if (symbols[i] == data) symbols.splice(i,1);
        }
        const url = "https://api.iextrading.com/1.0/stock/market/batch?symbols=" 
        + symbols.toString() + "&types=chart";
        
        request(url,function(err,data){
            if(err) throw err;
            var result = JSON.parse(data.body);
            var dataset = [];
            var labels = [];
            for (var i = 0; i < symbols.length; i ++) {
                var data = [];
                var key = symbols[i].toUpperCase();
                console.log(key);
                for(var x = 0; x < result[key].chart.length; x++) {
                    data.push(result[key].chart[x].close);
                    if (i<1) labels.push(result[key].chart[x].date);
                }
                dataset[i] = {
                    label: key,
                    data: data,
                    borderColor: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
                    borderJoinStyle: "miter",
                }
            }
            io.sockets.emit("serverSentData", [labels,dataset]);
        })

    })
})





app.get('/', function(req,res){
    res.render("index");
})

app.get("/demo", function(req,res){
    res.render("demo");
})

