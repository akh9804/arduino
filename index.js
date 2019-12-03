const express = require("express");
const path = require("path");
const fs = require("fs");
const data = require("./data.json");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

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
    temp: req.body.temp,
    time: req.body.time
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

io.on("connection", socket => {
  console.log("socket io is connected");
  socket.on("turn on", function(message) {
    console.log(message);
    setInterval(function() {
      socket.emit("send", data);
    }, 5000);
  });
});
