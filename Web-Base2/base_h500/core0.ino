void loopCore0(void *arg ) {
  
  delay(1000);

  // Inicia o sistema de arquivos SPIFFS e verifica se foi bem sucedido
  if(!SPIFFS.begin(true)){
        Serial.println("SPIFFS Mount Failed");
        return;
  }
  
  // Configura um ponto de acesso Wi-Fi
  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();  // Obtém o endereço IP do ponto de acesso
  Serial.println(IP);              // Imprime o endereço IP na porta serial
  Serial.println("Conectado");
  
  // Inicializa o WebSocket
  initWebSocket();

  // Define rotas para diferentes URLs no servidor web
  server.on("/", HTTP_GET, [](AsyncWebServerRequest * request) {
    Serial.println("aqui");
    request->send(SPIFFS, "/index.html", String(), false);
  });
  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/style.css", "text/css");
  });
  server.on("/main.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/script.js");
  });
  server.on("/favicon2.ico", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/favicon2.ico");
  });
  
  // Inicia o servidor web
  server.begin();

  // Loop principal do Core 0
  while (true) {
    // A cada 300 milissegundos, limpa os clientes WebSocket
    // e se houver dados válidos, envia dados para todos os clientes conectados
    if (millis() - time_step > 300) {
      ws.cleanupClients();
      if (get_checksum_struct(true) == packet_DATA.data.checksum) {
        accTotal = pow(pow(packet_DATA.data.mpu_Ax, 2) + pow(packet_DATA.data.mpu_Ay, 2) + pow(packet_DATA.data.mpu_Az, 2) , 0.5) / 9.81;
        ws.textAll("{\"code\":101,\"time\":" + String(packet_DATA.data.times) +
                   ",\"ej\":" + String(packet_DATA.data.status_eject) +
                   ",\"temp\":" + String(packet_DATA.data.bmp_temp) +
                   ",\"alt\":" + String(packet_DATA.data.bmp_alt_calib) +
                   ",\"acc\":" + String(accTotal) +
                   ",\"snr_a\":" + String(packet_DATA.data.snr) +
                   ",\"snr\":" + String(packetSNR) + "}");
      }
      time_step = millis();
    }
    delay(10);
  }
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  // Verifica se é a última parte da mensagem, se é a primeira e se é do tipo texto
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0; // Adiciona um terminador nulo para converter os dados em uma string (basicamente para garantir mesmo)

     // Compara a mensagem recebida com os diferentes comandos

    if (strcmp((char*)data, "start") == 0) {
      // Se a mensagem for "start", envia uma mensagem para todos os clientes com o código 100 e a operação "start"
      ws.textAll("{\"code\":100,\"op\":\"start\"}");
      packet_COMMAND.data.coleta = 59; // Define o valor do comando de coleta para 59

    } else if (strcmp((char*)data, "stop") == 0) {
      // Se a mensagem for "stop", envia uma mensagem para todos os clientes com o código 100 e a operação "stop"
      ws.textAll("{\"code\":100,\"op\":\"stop\"}");
      packet_COMMAND.data.coleta = 0; // Define o valor do comando de coleta para 0

    } else if (strcmp((char*)data, "calib") == 0) {
      // Se a mensagem for "calib", envia uma mensagem para todos os clientes com o código 100 e a operação "calib"
      ws.textAll("{\"code\":100,\"op\":\"calib\"}");
      packet_COMMAND.data.calib = 103; // Define o valor do comando de calibração para 103

    } else if (strcmp((char*)data, "eject") == 0) {
      // Se a mensagem for "eject", envia uma mensagem para todos os clientes com o código 100 e a operação "eject"
      ws.textAll("{\"code\":100,\"op\":\"eject\"}");
      packet_COMMAND.data.eject_m = 37; // Define o valor do comando de ejeção para 37

    } else if (strcmp((char*)data, "prior_eject") == 0){
      // Se a mensagem for "prior_eject", envia uma mensagem para todos os clientes com o código 100 e a operação "prior_eject"
      ws.textAll("{\"code\":100,\"op\":\"prior_eject\"}");
      packet_COMMAND.data.eject_m = 37; // Define o valor do comando de ejeção para 37

    } else if (strcmp((char*)data, "reset") == 0) {
      // Se a mensagem for "reset", envia uma mensagem para todos os clientes com o código 100 e a operação "reset"
      ws.textAll("{\"code\":100,\"op\":\"reset\"}");
      packet_COMMAND.data.reset_ = 157; // Define o valor do comando de reset para 157
    }
  }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type,
             void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      // Se um cliente se conectar, imprime o ID do cliente e seu endereço IP
      Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
      break;
    case WS_EVT_DISCONNECT:
      // Se um cliente se desconectar, imprime o ID do cliente
      Serial.printf("WebSocket client #%u disconnected\n", client->id());
      break;
    case WS_EVT_DATA:
      // Se dados forem recebidos de um cliente, chama a função handleWebSocketMessage para tratá-los
      handleWebSocketMessage(arg, data, len);
      break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
      // Não faz nada em resposta a um evento de Pong ou Erro
      break;
  }
}

void initWebSocket() {
  // Define a função de callback para lidar com eventos WebSocket
  ws.onEvent(onEvent);
  // Adiciona o manipulador WebSocket ao servidor
  server.addHandler(&ws);
}
