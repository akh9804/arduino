const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const redisAdapter = require("socket.io-redis");

const PORT = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

server.listen(PORT);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/", (req, res) => {
  const tempJSON = JSON.stringify({
    "t-temp": req.body.temp,
    "t-time": req.body.time,
    start_exp: 1,
    stop_exp: 0,
    "p-capture": 1,
    "v-capture": 1
  });

  fs.writeFile("./python.json", tempJSON, err => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully wrote file");
    }
  });

  res.end();
});

io.adapter(redisAdapter({ host: "localhost", port: 6379 }));

io.on("connection", socket => {
  console.log("socket io is connected");

  socket.on("turn on", function(message) {
    console.log(message);
    setInterval(function() {
      const data = JSON.stringify({
        experiment: [
          {
            second: Math.floor(Math.random() * 100),
            temperature: Math.floor(Math.random() * 50 + 40),
            pid: Math.floor(Math.random() * 100)
          }
        ]
      });
      socket.emit("send", data);
    }, 1000);
  });

  socket.on("turn off", function() {
    const tempJSON = JSON.stringify({
      "t-temp": null,
      "t-time": null,
      start_exp: 0,
      stop_exp: 1,
      "p-capture": 0,
      "v-capture": 0
    });

    fs.writeFile("./python.json", tempJSON, err => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        console.log("Successfully wrote file");
      }
    });
    socket.disconnect();
  });

  socket.on("disconnect", function() {
    console.log("socket io is disconnected");
  });
});
