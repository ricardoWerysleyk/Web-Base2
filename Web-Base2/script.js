'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DOS ELEMENTOS DO DOM (INTERFACE) ---
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


    // --- INICIALIZAÇÃO DO WEBSOCKET ---
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
        // code 100 sinaliza que a messagem é callback de algum butão
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
    // --- FIM INICIALIZAÇÃO DO WEBSOCKET ---

    function initButton() {
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
        accelerationValue.textContent =
            (
            Math.pow(
                Math.pow(data.Ax, 2) + Math.pow(data.Ay, 2) + Math.pow(data.Az, 2),
                0.5
            ) / 9.81
            ).toFixed(2) + " G";
    }





    
    // --- SELEÇÃO DOS ELEMENTOS DO DOM (MODAL) ---
    const modal = {
        overlay: document.getElementById('confirmation-modal'),
        title: document.getElementById('modal-title'),
        btnYes: document.getElementById('modal-btn-yes'),
        btnNo: document.getElementById('modal-btn-no'),
        closeButton: document.querySelector('.close-button'),
    };

    // Variável para guardar a ação a ser confirmada
    let actionToConfirm = null;

    // --- LÓGICA DO MODAL ---

    /**
     * Abre o modal com uma mensagem customizada e guarda a ação a ser executada.
     * @param {string} message - A pergunta de confirmação.
     * @param {function} actionFunction - A função a ser chamada se o usuário clicar em "Sim".
     * @param {boolean} isDangerous - Se a ação é crítica (muda a cor do botão Sim).
     */
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

    /**
     * Fecha o modal e limpa a ação guardada.
     */
    function closeModal() {
        modal.overlay.classList.remove('active');
        actionToConfirm = null; // Limpa a ação para segurança
    }

    // Event listener para o botão "Sim" do modal
    modal.btnYes.addEventListener('click', () => {
        if (typeof actionToConfirm === 'function') {
            actionToConfirm(); // Executa a ação guardada
        }
        closeModal();
    });

    // Event listeners para fechar o modal
    modal.btnNo.addEventListener('click', closeModal);
    modal.closeButton.addEventListener('click', closeModal);
    modal.overlay.addEventListener('click', (event) => {
        // Fecha o modal apenas se o clique for no fundo escuro, não no conteúdo
        if (event.target === modal.overlay) {
            closeModal();
        }
    });


    // --- FUNÇÕES DE AÇÃO PRINCIPAIS (AQUI VOCÊ COLOCA A LÓGICA REAL) ---
    // Estas são as funções que serão chamadas APÓS a confirmação.

    function startSystem() {
        console.log("✅ Ação confirmada: Iniciar Sistema");
        
        websocket.send("start");

        // ... (código de simulação para testes continua o mesmo)
        // --- FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO DA INTERFACE ---
        /**
         * Atualiza a interface com os novos dados de telemetria.
         * @param {object} data - O objeto de dados recebido via WebSocket.
         * Exemplo de objeto: { altitude: 150.7, acceleration: 10.2, snr: -10, snr_a: -12, ejection: "Habilitada" }
         */
        function updateTelemetryUI(data) {
            altitudeValue.textContent = data.altitude.toFixed(2);
            accelerationValue.textContent = data.acceleration.toFixed(2);
            snrValue.textContent = data.snr.toFixed(1);
            snrAValue.textContent = data.snr_a.toFixed(1);

            // Atualiza o texto e a classe do status de ejeção
            ejectionStatus.textContent = data.ejection;
            ejectionStatus.className = ''; // Limpa classes antigas
            switch (data.ejection) {
                case 'Desabilitada':
                    ejectionStatus.classList.add('status-desabilitada');
                    break;
                case 'Habilitada':
                    ejectionStatus.classList.add('status-habilitada');
                    break;
                case 'Ejetada':
                    ejectionStatus.classList.add('status-ejetada');
                    break;
            }
        }
        // --- SIMULADOR DE DADOS (REMOVA OU COMENTE ESTA SEÇÃO) ---
        // Este código serve apenas para demonstrar a atualização da interface.
        function simulateData() {
            const ejectionStates = ['Desabilitada', 'Habilitada', 'Ejetada'];
            const simulatedData = {
                altitude: Math.random() * 3000,
                acceleration: (Math.random() * 5) + 9.8,
                snr: (Math.random() * -20),
                snr_a: (Math.random() * -20) - 2,
                ejection: ejectionStates[Math.floor(Math.random() * ejectionStates.length)]
            };
            updateTelemetryUI(simulatedData);
        }
        // Inicia a simulação, atualizando a cada 2 segundos.
        setInterval(simulateData, 2000); 
        // FIM DA SEÇÃO DO SIMULADOR
    }

    function calibrateSystem() {
        console.log("✅ Ação confirmada: Calibrar Sensores");

        websocket.send("calib");
        setTimeout(() => {
            websocket.send("calib");
        }, 100);
    }

    function resetSystem() {
        console.log("✅ Ação confirmada: Resetar Aviônica");
        
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


    // --- CONECTANDO OS BOTÕES DA INTERFACE AO MODAL ---

    controlButtons.start.addEventListener('click', () => {
        openModal('Deseja realmente iniciar o sistema?', startSystem);
    });

    controlButtons.calibrate.addEventListener('click', () => {
        openModal('Confirmar calibração dos sensores?', calibrateSystem);
    });

    controlButtons.reset.addEventListener('click', () => {
        openModal('Você tem certeza que deseja resetar a aviônica?', resetSystem);
    });

    controlButtons.eject.addEventListener('click', () => {
        // Para a ejeção, usamos o parâmetro 'isDangerous' para deixar o botão "Sim" vermelho
        openModal('CRÍTICO: Confirmar EJEÇÃO do paraquedas?', ejectSystem, true);
    });


    // -------------------------------------------------------------------
    // --- FUNÇÕES DE ATUALIZAÇÃO DA INTERFACE E SIMULAÇÃO (COMO ANTES) ---
    // -------------------------------------------------------------------

    function updateTelemetryUI(data) {
        // ... (código para atualizar altitude, aceleração, etc. continua o mesmo)
    }
});