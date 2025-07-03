var gateway = `ws://${window.location.hostname}/ws`;
var websocket;

const ejecao = {
  0: "Desabilitada",
  1: "Habilitada",
  2: "Ejetada",
};

function initWebSocket() {
  console.log("Trying to open a WebSocket connection...");
  websocket = new WebSocket(gateway);
  websocket.onopen = onOpen;
  websocket.onclose = onClose;
  websocket.onmessage = onMessage; // <-- add this line
}

function onOpen(event) {
  console.log("Connection opened");
}

function onClose(event) {
  console.log("Connection closed");
  setTimeout(initWebSocket, 2000);
}

function onMessage(event) {
  data_json = JSON.parse(event.data);

  if (data_json.code == 100) {
    // code 100 sinaliza que a messagem é callback de algum butão
    switch (data_json.op) {
      case "start":
        callbackStart();
        break;
      case "stop":
        callbackStop();
        break;
      case "reset":
        callbackEject();
        break;
      case "calib":
        callbackCalib();
        break;
      case "eject":
        callbackEject();
        break;
    }
  } else if (data_json.code == 101) {
    //code 101 sinaliza que a messagem é de dados
    updateData(data_json);
  }
}

window.addEventListener("load", onLoad);
function onLoad(event) {
  initWebSocket();
  initButton();
}

function initButton() {
  // --------------- link dos botões -------------------
  document.getElementById("calib").addEventListener("click", (event) => {
    websocket.send("calib");
    setTimeout(() => {
      websocket.send("calib");
    }, 100);
  });
  document.getElementById("reset").addEventListener("click", avionicaReset);
  document.getElementById("eject").addEventListener("click", (event) => {
    websocket.send("eject");
    setTimeout(() => {
      websocket.send("eject");
    }, 100);
  });
  document.getElementById("start").addEventListener("click", (event) => {
    websocket.send("start");
  });
  document.getElementById("stop").addEventListener("click", (event) => {
    websocket.send("stop");
  });
}
// ------- funções de callback dos botões-----------------
function callbackEject() {}
function callbackReset() {}
function callbackCalib() {}
function callbackStart() {
  document.getElementById("stop").removeAttribute("style");
  document.getElementById("start").setAttribute("style", "display:none");
  console.log("ligou");
}
function callbackStop() {
  document.getElementById("start").removeAttribute("style");
  document.getElementById("stop").setAttribute("style", "display:none");
  console.log("desligou");
}

// ------- fim de funções de callback dos botões-----------------

//-------------------- Atualização do display---------------------
// const data2 = {
// 	alt : '100',
// 	Ax : '2',
// 	Ay : '3',
// 	Az : '1',
// 	Gx : '5',
// 	Gy : '7',
// 	Gz : '2',
// 	tem : '20',
// 	pre : '609986875',
// 	snr : '18',
// 	ej : '2'
// }

// updateData(data2);

function updateData(data) {
  time = new Date(data.time);
  document.getElementById("time_display").innerText =
    "Time: " +
    time.getUTCMinutes().toString().padStart(2, "0") +
    ":" +
    time.getUTCSeconds().toString().padStart(2, "0");
  document.getElementById("potencia_nivel").innerText = data.alt + " m";
  document.getElementById("Ax").innerText = data.Ax + " m/s²";
  document.getElementById("Ay").innerText = data.Ay + " m/s²";
  document.getElementById("Az").innerText = data.Az + " m/s²";
  document.getElementById("Gx").innerText = data.Gx + "rad/s";
  document.getElementById("Gy").innerText = data.Gy + "rad/s";
  document.getElementById("Gz").innerText = data.Gz + "rad/s";
  document.getElementById("temp").innerText = data.temp + "°C";
  document.getElementById("pre").innerText = data.pre + " Pa";
  document.getElementById("snr").innerText = data.snr + " db";
  document.getElementById("snr_a").innerText = data.snr_a + " db";
  document.getElementById("status_eject").innerText = ejecao[data.ej];
  document.getElementById("vel_nivel").innerText =
    (
      Math.pow(
        Math.pow(data.Ax, 2) + Math.pow(data.Ay, 2) + Math.pow(data.Az, 2),
        0.5
      ) / 9.81
    ).toFixed(2) + " G";
}
//-------------------------- fim do display-----------------------------

// Modal reset confirm

const avionicaReset = () => {
  modalReset.classList.toggle("show");
  btnCancel.addEventListener("click", () => {
    modalReset.classList.remove("show");
  });
  btnConfirm.addEventListener("click", () => {
    modalReset.classList.remove("show");
    setTimeout(() => {
      websocket.send("reset");
    }, 100);
  });
};
