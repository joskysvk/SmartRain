#!/usr/local/bin/node
// https://www.w3schools.com/nodejs/nodejs_raspberrypi_webserver_websocket.asp
let http = require('http');
let path = require('path');
let fs = require('fs');
// let Fs = require('fs-extra')
let Gpio = require('onoff').Gpio;
let CronJob = require('cron').CronJob;
let vetvy = []
let io = {}
let pass = ""
let user = ""
// let confFile="/opt/SmartRain/smartrain.json"

let confFile='smartrain.json';
'use strict';

function Initialize()
{
    InitVetvy();
    for (vetva of vetvy)    // samostatny for cyklus pre rychle nulovanie portov
    {
        InitGpio(vetva);
    }
    for (vetva of vetvy)
    {
        CreateJob(vetva);
    }
}

function InitVetvy()
{
    try{
        let rawdata = fs.readFileSync(path.resolve(__dirname,confFile));
        vetvy = JSON.parse(rawdata);
        console.log("Read configuration[" + confFile + "] is suscesfull");
    }
    catch(e)
    {
        console.log("Read configuration[" + confFile + "] is failed: " + e.toString());
        process.exit(); 
    }
}

function saveVetvy () {  
    newVetvy = []
    for(nv of vetvy)
    {
        vt = {
            "io": nv.io,
            "name": nv.name,
            "desc": nv.desc,
            "pin": nv.pin,
            "automat": nv.automat,
            "openTime": nv.openTime,
            "plan": nv.plan
        }
        newVetvy.push(vt)
    }
    let json = JSON.stringify(newVetvy, null, 2)
    try {
        fs.writeFileSync(path.resolve(__dirname,confFile), json)
    } catch (error) {
        console.error(error)
    }
}

function InitGpio(vetva)
{
    try
    {
        vetva.gpio = new Gpio(vetva.pin, vetva.io)
        vetva.gpio.setActiveLow(true);
        vetva.gpio.writeSync(0);
    }
    catch(e)
    {
        //console.log("Init vetva["+vetva.name+"] failed");
    }
}

function UninitGpio(vetva)
{
    try{
        vetva.gpio.writeSync(0);
        vetva.gpio.unexport();
    }
    catch(e)
    {
        //console.log("Uninnitialize vetva["+vetva.name+"] failed");
    }
}

function CreateJob(vetva)
{
    // pre vytvaranie jobu je potrebne: s m h D M Y   Ja pouzivam minimum minutu tak preto doplnam 0 na zaciatok
    vetva.job = new CronJob("0 " + vetva.plan, function() {
        SetStateVetva(vetva, 1);
        vetva.timerKill = setTimeout(function(arg){
            SetStateVetva(vetva, 0);
            vetva.timerKill = -1;
        }, vetva.openTime*1000*60, vetva.name);
    }, null, vetva.automat, 'Europe/Bratislava');
}

function handler (req, res) { //create server
    let requrl = req.url.split('?');
    let endpoint = requrl[0];
    if(endpoint == "/cfgwrite")
    {
        // curl 'http://zavlaha:8080/cfgwrite?pass=aaaa'
        let args = requrl[1].split('&');
        let wpass = ""
        for (let arg of args)
        {
            cmd = arg.split('=');
            if (cmd[0] == "pass") wpass = cmd[1];
        }
        if(wpass != pass)
        {
            res.writeHead(401, {'Content-Type': 'text/html'});
            return res.end("Unauthorized");
        }
        if (request.method == 'POST') {
            let body = ''
            request.on('data', function(data) {
                body += data
            })
            request.on('end', function() {
                console.log('Configuration write web api:' )
                console.log(body)
                try{
                    vetvy = JSON.parse(body);
                    fs.writeFileSync(path.resolve(__dirname,confFile), body);
                    for (vetva of vetvy)
                    {
                        vetva.gpio = new Gpio(vetva.pin, vetva.io)
                        vetva.gpio.setActiveLow(true);
                        vetva.gpio.writeSync(0);
                    }
                }
                catch(e)
                {
                    res.writeHead(401, {'Content-Type': 'text/html'});
                    return res.end("Configuration failed: " + e.toString());
                }
                response.writeHead(200, {'Content-Type': 'text/html'})
                response.end('post received')
            })
        }
    }
    else if(endpoint == "/cfgread")
    {
        // curl 'http://zavlaha:8080/cfgread?pass=aaaa'
        let args = requrl[1].split('&');
        let wpass = ""
        for (let arg of args)
        {
            cmd = arg.split('=');
            if (cmd[0] == "pass") wpass = cmd[1];
        }
        if(wpass != pass)
        {
            res.writeHead(401, {'Content-Type': 'text/html'});
            return res.end("Unauthorized");
        }
        let cfg=[]
        for (let vetva of vetvy)
        {
            cfgx={
                name:vetva.name,
                desc:vetva.desc,
                pin:vetva.pin,
                io:vetva.io,
                openTime:vetva.openTime,
                plan:vetva.plan,
                automat:vetva.automat
            }
            cfg.push(cfgx)
        }
        res.writeHead(200, {'Content-Type': 'json'});
        return res.end(JSON.stringify(cfg)); 
    }
    else if(endpoint == "/api")
    {
        // curl 'http://zavlaha:8080/api?vetva=Kvapkova&stav=1&pass=aaaa'
        let args = requrl[1].split('&');
        let vetva = {}
        let stav = -1
        let wpass = ""
        for (let arg of args)
        {
            cmd = arg.split('=');
            if (cmd[0] == "vetva") svetva = cmd[1];
            if (cmd[0] == "stav") sstav = cmd[1];
            if (cmd[0] == "pass") wpass = cmd[1];
        }
        vetva = vetvy.find(element => element.name == svetva);
        if (vetva === undefined)
        {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end("Vetva not found");
        }
        stav = Number(sstav)

        if(isNaN(stav) || stav < 0 || stav > 1) 
        {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end("State not setable");
        }

        if(wpass != pass)
        {
            res.writeHead(401, {'Content-Type': 'text/html'});
            return res.end("Unauthorized");
        }

        SetStateVetva(vetva, stav)

        res.writeHead(200, {'Content-Type': 'text/html'});
        return res.end("OK");    
    }
    else
    {
        let fl=""
        if(req.url == "/" || req.url == "/login")fl="/public/index.html";
        else fl="/public" + req.url;
        // console.log(__dirname + fl);
        fs.readFile(__dirname + fl, function(err, data) {
            if (err) {
                // console.log ('file not found: ' + fl);
                res.writeHead(404, "Not Found");
                res.end();
            } else {
                var dotoffset = req.url.lastIndexOf('.');
                var mimetype = dotoffset == -1
                                ? 'text/html'
                                : {
                                    '.html' : 'text/html',
                                    '.ico' : 'image/x-icon',
                                    '.jpg' : 'image/jpeg',
                                    '.png' : 'image/png',
                                    '.gif' : 'image/gif',
                                    '.css' : 'text/css',
                                    '.js' : 'text/javascript'
                                    }[ req.url.substr(dotoffset) ];
                try{
                    res.setHeader('Content-type' , mimetype);
                }
                catch(e)
                {
                    res.setHeader('Content-type' , 'text/html');
                }
                if(mimetype != 'text/html')
                    res.setHeader('Cache-Control',' max-age=3600')
                res.end(data);
                // console.log( req.url, mimetype );
            } 
        });
    }
}

function GetStateVetva(vetva)
{
    try
    {
        return vetva.gpio.readSync();
    }
    catch (e)
    {
        //console.log("Read vetva["+vetva.name+"] failed");
    }
    return 0
}

function SetStateVetva(vetva, state)
{
    let pStav = Number(state)
    try
    {
        if (pStav != vetva.gpio.readSync())
        {   
            vetva.gpio.writeSync(pStav);
        }   
        msg={
            "type": "vetva",
            "name":vetva.name, 
            "state":vetva.gpio.readSync()
        }
    }

    catch (e)
    {
        //console.log("Write vetva["+vetva.name+"] failed");
        msg={
            "type": "vetva",
            "name":vetva.name, 
            "state":pStav
        }
    }
    console.log("Vetva["+vetva.name+"] set to " + pStav.toString())
    io.emit("vetvaStav", msg);
}

function ioConnectd(socket)
{
    // console.log("Conected");
    for(vetva of vetvy)
    {
        vetvaStav={
            "type": "vetva",
            "name":vetva.name, 
            "state":GetStateVetva(vetva)
        };
        automatStav={
            "type": "automat",
            "name": vetva.name, 
            "state": vetva.automat,
            "plan": vetva.plan,
            "openTime": vetva.openTime
        };
        socket.emit("vetvaStav", vetvaStav);
        socket.emit("automatStav", automatStav);
    }
    socket.on("vetvaStav", function(data) { 
            vetva = vetvy.find(element => element.name == data.name);
            SetStateVetva(vetva,data.state)
    });
    socket.on("automatStav", function(data) { 
        vetva = vetvy.find(element => element.name == data.name);
        msg={
            "type": "automat",
            "name":vetva.name, 
            "state":Number(data.state),
            "plan": data.plan,
            "openTime": data.openTime
        };
        io.emit("automatStav", msg);
        if( data.state != vetva.automat || data.plan != vetva.plan || data.openTime != vetva.openTime)
        {
            SetStateVetva(vetva, 0);
            if(vetva.timerKill != 0) {
                clearTimeout(vetva.timerKill);
                vetva.timerKill = 0;
            }
            vetva.automat = data.state;
            vetva.plan = data.plan;
            vetva.openTime = data.openTime;
            let text=(vetva.automat)? "zapnuty":"vypnuty"
            console.log("Automat["+vetva.plan+" , "+vetva.openTime.toString()+" minut, "+vetva.name+"] je " + text )
            saveVetvy();
            vetva.job.stop();
            CreateJob(vetva);
        }
    });
    socket.on("vetvaAdd", function(data) { 
        vt = {
            "io": "out",
            "name": data.name,
            "desc": data.desc,
            "pin": data.pin,
            "automat": 0,
            "openTime": 1,
            "plan": "0 * * * *"
        };
        InitGpio(vt);
        vetvy.push(vt);
        saveVetvy();
        vetvaStav={
            "type": "vetva",
            "name":vetva.name, 
            "state":GetStateVetva(vetva)
        };
        io.emit("vetvaStav", vetvaStav);     
    });
    socket.on("vetvaDel", function(data) { 
        index = vetvy.findIndex(element => element.name == data.name);
        if(index == -1) socket.emit("vetvaDel", {"name":vetva.name, "error":1, "msg":"Not found"}); 
        UninitGpio(vetvy[index]);
        delete vetvy[index];
        io.emit("vetvaDel", {"name":vetva.name, "error":0, "msg":"Deleted"});
    });
}

function help(msg="")
{
    if(msg != "") console.log("Warning: " + msg)
    console.log("SmartRain - automaticka zavlaha");
    console.log("smartRain.js -p [port] -u [user] -s [pass]")
    process.exit();
}

function main()
{
    Initialize();
    let argv = require('minimist')(process.argv.slice(2));
    let port = argv.p;
    pass = argv.s;
    user = argv.u;
    hlp = argv.h;
    if(hlp) help();
    if(port === undefined) help("Port is not defined")
    try{
        let webServer = http.createServer(handler);
        webServer.listen(Number(port)); 
        io = require('socket.io')(webServer);
        io.set('authorization', function (handshakeData, callback) {
            if(handshakeData._query.pwd == pass && handshakeData._query.usr == user) callback(null, true);
            else callback("Error asdad",false);
        });
        io.sockets.on('connection',ioConnectd);
        console.log("SmartRain je spusteny localhost:" + port);
    }
    catch(e)
    {
        console.log("SmartRain sa nespustil: " + e.toString());
        process.exit();
    }
    
    process.on('SIGINT', function () { //on ctrl+c

        for(vetva of vetvy)
        {
            UninitGpio(vetva);
            console.log("Vypnuta " + vetva.desc);
        }
        console.log("Zavlahovy system je vypnuty");
        process.exit(); 
    });
}
main()