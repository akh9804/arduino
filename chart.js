let tempData = [];
let tempTime = [];
let pidData = [];
let pidTime = [];

let socket = io.connect("https://guarded-brook-94951.herokuapp.com/");

const form = document.getElementById("form");
const executionBtn = document.getElementById("execution");
const cancelBtn = document.getElementById("cancel");
const currentTemp = document.getElementById("current-temp");
const currentTime = document.getElementById("current-time");
const targetTemp = document.getElementById("target-temp");
const targetTime = document.getElementById("target-time");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  tempData = [];
  tempTime = [];
  pidData = [];
  pidTime = [];

  axios({
    method: "post",
    url: "/",
    data: {
      temp: targetTemp.value,
      time: targetTime.value
    }
  });

  targetTemp.setAttribute("disabled", true);
  targetTime.setAttribute("disabled", true);

  if (socket.disconnected) {
    socket.connect();
  }

  socket.emit("turn on", { success: true });
  executionBtn.setAttribute("disabled", true);
});

cancelBtn.addEventListener("click", function(e) {
  e.preventDefault();
  executionBtn.removeAttribute("disabled");
  targetTemp.removeAttribute("disabled");
  targetTime.removeAttribute("disabled");
  socket.emit("turn off");
});

socket.on("send", function(raw_data) {
  let data = JSON.parse(raw_data).experiment[0];
  console.log(data);

  tempData.push(data.temperature);
  pidData.push(data.pid);
  tempTime.push(data.second);
  pidTime.push(data.second);

  currentTemp.innerText = data.temperature;
  currentTime.innerText = data.second;

  const temp = document.getElementById("temp__chart");
  const pid = document.getElementById("pid__chart");

  new Chart(temp, {
    type: "line",
    data: {
      labels: tempTime,
      datasets: [
        {
          label: "실시간 온도 변화",
          data: tempData,
          borderColor: "rgba(255, 201, 14, 1)",
          backgroundColor: "rgba(255, 201, 14, 0.5)",
          fill: false,
          lineTension: 0
        }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      title: {
        display: true,
        text: "라인 차트 테스트"
      },
      tooltips: {
        mode: "index",
        intersect: false
      },
      hover: {
        mode: "nearest",
        intersect: true
      },
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "시간"
            }
          }
        ],
        yAxes: [
          {
            display: true,
            ticks: {
              suggestedMin: 0
            },
            scaleLabel: {
              display: true,
              labelString: "온도"
            }
          }
        ]
      }
    }
  });

  new Chart(pid, {
    type: "line",
    data: {
      labels: pidTime,
      datasets: [
        {
          label: "실시간 PID 변화",
          data: pidData,
          borderColor: "rgba(116, 185, 255,1.0)",
          backgroundColor: "rgba(116, 185, 255,1.0)",
          fill: false,
          lineTension: 0
        }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      title: {
        display: true,
        text: "PID 그래프"
      },
      tooltips: {
        mode: "index",
        intersect: false
      },
      hover: {
        mode: "nearest",
        intersect: true
      },
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "시간"
            }
          }
        ],
        yAxes: [
          {
            display: true,
            ticks: {
              suggestedMin: 0
            },
            scaleLabel: {
              display: true,
              labelString: "PID"
            }
          }
        ]
      }
    }
  });
});
