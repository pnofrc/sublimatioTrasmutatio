port = 8080

var Msg = '';

var WebSocketServer = require('ws').Server

    , wss = new WebSocketServer({port});

    wss.on('connection', function(ws) {

        ws.on('message', function(message) {

        console.log('Received from client: %s', message);

        ws.send('Server received from client: ' + message);

    });

 });

console.log("Websocket Server started on port " + port);
