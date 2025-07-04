'use strict';

document.addEventListener('DOMContentLoaded', () => {
    //  SELEÇÃO DOS ELEMENTOS DO DOM (INTERFACE) 
    const altitudeValue = document.getElementById('altitude-value');
    const accelerationValue = document.getElementById('acceleration-value');
    const snrValue = document.getElementById('snr-value');
    const snrAValue = document.getElementById('snr-a-value');
    const ejectionStatus = document.getElementById('ejection-status');
    const timeOperation = document.getElementById('milis');
    const controlButtons = {
        start: document.getElementById('btn-start'),
        calibrate: document.getElementById('btn-calibrate'),
        reset: document.getElementById('btn-reset'),
        eject: document.getElementById('btn-eject'),
    };


    //  INICIALIZAÇÃO DO WEBSOCKET 
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
        websocket.onmessage = onMessage;
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
            // code 100 sinaliza que a messagem é callback de algum botão
            switch (data_json.op) {
                case "start":
                    callbackStart();
                    break;
                case "stop":
                    callbackStop();
                    break;
                case "reset":
                    callbackReset();
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

    initWebSocket();
    //  FIM INICIALIZAÇÃO DO WEBSOCKET 

  
    // - funções de callback dos botões--
    function callbackEject() {}
    function callbackReset() {}
    function callbackCalib() {}
    function callbackStart() {
        console.log("ligou");
    }
    function callbackStop() {
        console.log("desligou");
    }

    function updateData(data) {
        time = new Date(data.time);
        timeOperation.textContent =
            time.getUTCMinutes().toString().padStart(2, "0") +
            ":" +
            time.getUTCSeconds().toString().padStart(2, "0");
        altitudeValue.textContent = data.alt;
        snrValue.textContent = data.snr;
        snrAValue.textContent = data.snr_a;
        ejectionStatus.textContent = ejecao[data.ej];
        accelerationValue.textContent = data.acc;
    }

    
    //  SELEÇÃO DOS ELEMENTOS DO MODAL
    const modal = {
        overlay: document.getElementById('confirmation-modal'),
        title: document.getElementById('modal-title'),
        btnYes: document.getElementById('modal-btn-yes'),
        btnNo: document.getElementById('modal-btn-no'),
        closeButton: document.querySelector('.close-button'),
    };

    // Variável para guardar a ação a ser confirmada
    let actionToConfirm = null;

    //  LÓGICA DO MODAL 
    function openModal(message, actionFunction, isDangerous = false) {
        modal.title.textContent = message;
        actionToConfirm = actionFunction;
        
        if (isDangerous) {
            modal.btnYes.classList.add('danger');
        } else {
            modal.btnYes.classList.remove('danger');
        }
        
        modal.overlay.classList.add('active');
    }

    //Fecha o modal e limpa a ação guardada.
    function closeModal() {
        modal.overlay.classList.remove('active');
        actionToConfirm = null; 
    }

    // Event listener para o botão "Sim" do modal
    modal.btnYes.addEventListener('click', () => {
        if (typeof actionToConfirm === 'function') {
            actionToConfirm();
        }
        closeModal();
    });

    // Event listeners para fechar o modal
    modal.btnNo.addEventListener('click', closeModal);
    modal.closeButton.addEventListener('click', closeModal);
    modal.overlay.addEventListener('click', (event) => {
        if (event.target === modal.overlay) {
            closeModal();
        }
    });


    // Funções chamadas pelos botões

    function startSystem() {
        console.log("✅ Ação confirmada: Iniciar coleta.");
    
        //websocket.send("start");
        setTimeout(() => {
            websocket.send("start");
        }, 100);

        controlButtons.start.classList.add('stop');
        controlButtons.start.innerText = "Parar";
    }

    function stopSystem() {
        console.log("✅ Ação confirmada: Parar coleta.");
        controlButtons.start.classList.remove('stop');
        controlButtons.start.innerText = "Iniciar";

        //websocket.send("stop");
        setTimeout(() => {
            websocket.send("stop");
        }, 100);
    }

    function calibrateSystem() {
        console.log("✅ Ação confirmada: Calibrar Sensores.");

        websocket.send("calib");
        setTimeout(() => {
            websocket.send("calib");
        }, 100);
    }

    function resetSystem() {
        console.log("✅ Ação confirmada: Resetar Aviônica.");
        resetTelemetryData();
        setTimeout(() => {
            websocket.send("reset");
        }, 100);
    }

    function ejectSystem() {
        console.log("🔥🔥🔥 Ação CRÍTICA confirmada: EJETAR!");
        
        websocket.send("eject");
        setTimeout(() => {
            websocket.send("eject");
        }, 100);
    }


    //  Conexão botões e modal

    controlButtons.start.addEventListener('click', () => {
        if(!controlButtons.start.classList.contains('stop')) {
            openModal('Deseja realmente iniciar a coleta?', startSystem);
        }else{
            openModal('Deseja realmente parar a coleta?', stopSystem);
        }
        
    });

    controlButtons.calibrate.addEventListener('click', () => {
        openModal('Confirmar calibração dos sensores?', calibrateSystem);
    });

    controlButtons.reset.addEventListener('click', () => {
        openModal('Você tem certeza que deseja resetar a aviônica?', resetSystem);
    });

    controlButtons.eject.addEventListener('click', () => {
        openModal('CRÍTICO: Confirmar EJEÇÃO do paraquedas?', ejectSystem, true);
    });

    function resetTelemetryData() {
        altitudeValue.textContent = '0.00';
        accelerationValue.textContent = '0.00';
        snrValue.textContent = '0.0';
        snrAValue.textContent = '0.0';
        ejectionStatus.textContent = 'Desabilitada';
        ejectionStatus.className = '';
        ejectionStatus.classList.add('status-desabilitada');
        timeOperation.textContent = '00:00:00';
    }
});