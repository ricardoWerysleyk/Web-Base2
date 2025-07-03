'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- SELEÇÃO DOS ELEMENTOS DO DOM ---
    const altitudeValue = document.getElementById('altitude-value');
    const accelerationValue = document.getElementById('acceleration-value');
    const snrValue = document.getElementById('snr-value');
    const snrAValue = document.getElementById('snr-a-value');
    const ejectionStatus = document.getElementById('ejection-status');

    const btnStart = document.getElementById('btn-start');
    const btnCalibrate = document.getElementById('btn-calibrate');
    const btnReset = document.getElementById('btn-reset');
    const btnEject = document.getElementById('btn-eject');

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


    // --- INTEGRAÇÃO COM WEBSOCKET (LOCAL A SER EDITADO) ---
    /*
        Aqui você deve colocar a sua lógica de conexão WebSocket.
        Exemplo:

        const socket = new WebSocket('ws://seu-servidor-websocket.com');

        socket.onopen = function(event) {
            console.log("Conexão WebSocket estabelecida!");
        };

        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            updateTelemetryUI(data);
        };

        socket.onclose = function(event) {
            console.log("Conexão WebSocket fechada.");
        };

        socket.onerror = function(error) {
            console.error("Erro no WebSocket:", error);
        };
    */


    // --- LÓGICA DOS BOTÕES DE CONTROLE ---
    // Você deve adicionar a lógica de envio de mensagem via WebSocket aqui.
    btnStart.addEventListener('click', () => {
        console.log("Comando 'Iniciar' enviado.");
        // Ex: socket.send(JSON.stringify({ command: 'start' }));
    });

    btnCalibrate.addEventListener('click', () => {
        console.log("Comando 'Calibrar' enviado.");
        // Ex: socket.send(JSON.stringify({ command: 'calibrate' }));
    });

    btnReset.addEventListener('click', () => {
        console.log("Comando 'Resetar' enviado.");
        // Ex: socket.send(JSON.stringify({ command: 'reset' }));
    });

    btnEject.addEventListener('click', () => {
        // Confirmação para uma ação perigosa
        if (confirm("Você tem certeza que deseja enviar o comando de EJEÇÃO?")) {
            console.log("Comando 'Ejetar' enviado.");
            // Ex: socket.send(JSON.stringify({ command: 'eject' }));
        }
    });


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
});