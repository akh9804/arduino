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

function getLastItem(obj) {
  let resultObj = {
    temp: obj.temp[obj.temp.length - 1].temp,
    time: obj.temp[obj.temp.length - 1].time
  };

  return resultObj;
}

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const targetTemp = document.getElementById("target-temp");
  const targetTime = document.getElementById("target-time");

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
  socket.emit("turn off");
});

socket.on("send", function(data) {
  tempData = [];
  tempTime = [];
  pidData = [];
  pidTime = [];

  data.temp.forEach(element => {
    tempData.push(element.temp);
    tempTime.push(element.time);
  });

  data.pid.forEach(element => {
    pidData.push(element.pid);
    pidTime.push(element.time);
  });

  currentTemp.innerText = getLastItem(data).temp;
  currentTime.innerText = getLastItem(data).time;

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
