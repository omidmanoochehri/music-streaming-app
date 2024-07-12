module.exports = function (server) {
    var io = require("socket.io")(server,{
        cors: {
          origin: '*',
        }
      });
    const fs = require('fs');

    io.on("connection", (socket) => {
        console.log("New client connected");

        var rs = fs.createReadStream('./media/podcasts/Tehran Night #279 Rubsilent.mp3');
        rs.on("data", chunk => {
            // ao.write(chunk);
            console.log("data")
            getApiAndEmit(socket, chunk);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

    const getApiAndEmit = (socket, data) => {
        // Emitting a new message. Will be consumed by the client
        socket.emit("channel1", data);
    };




}

