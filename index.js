const express = require("express");
const path = require("path");
const fs = require("fs");

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
    Option: {
      t_temp: Number(req.body.temp),
      t_time: Number(req.body.time),
      start_exp: 1
    }
  });

  fs.writeFile("../experiment.json", tempJSON, err => {
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

  fs.readFile("../experiment.json", "utf-8", (err, data) => {
    data = JSON.parse(data).Option;
    if (data["start_exp"] === 1) {
      socket.emit("already on", {
        temp: data["t_temp"],
        time: data["t_time"]
      });
    }
  });

  socket.on("turn on", function(message) {
    console.log(message);
    setInterval(function() {
      fs.readFile("../experiment.json", "utf-8", (err, data) => {
        data = JSON.parse(data).Option;
        if (data["start_exp"] === 0) {
          socket.disconnect();
        }
      });

      fs.readFile("../exp_result.json", "utf-8", (err, data) => {
        socket.emit("send", data);
      });
    }, 1000);
  });

  socket.on("turn off", function() {
    const tempJSON = JSON.stringify({
      Option: {
        t_temp: null,
        t_time: null,
        start_exp: 0
      }
    });

    fs.writeFile("../experiment.json", tempJSON, err => {
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

  socket.on("take a picture", function() {
    const tempJSON2 = JSON.stringify({
      Option: {
        p_capture: 1
      }
    });

    fs.writeFile("../Exp_camera.json", tempJSON2, err => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        console.log("Successfully wrote file");
      }
    });
  });
});
