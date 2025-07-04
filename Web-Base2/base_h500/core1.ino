void loopCore1(void *arg ){
  // Inicializa as classes SPI para comunicação SPI com os dispositivos
  SPIClass * vspi = NULL;
  SPIClass * hspi = NULL;

  vspi = new SPIClass(VSPI);
  hspi = new SPIClass(HSPI);
  vspi->begin();
  hspi->begin(); 
  
  // Configuração do módulo LoRa
  LoRa.setSPI(*hspi);
  LoRa.setPins(HSPI_SS, rst, dio0); 
  if (!LoRa.begin(LORA_BAND)) {
    Serial.println("Erro ao iniciar LoRa");
    while(1);
  }
  LoRa.setSignalBandwidth(LORA_SSBW);
  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setCodingRate4(LORA_CR);
  LoRa.setPreambleLength(LORA_PREAMBLE_LEN);
  LoRa.setSyncWord(LORA_SYNC_WORD);
  LoRa.setTxPower(20);
  LoRa.enableCrc();
  // Inicialização do cartão SD
  if (!SD.begin()) {
    Serial.println("Falha ao inicializar o cartão SD.");
  }
  
  // Configura as preferências
  preferences.begin("storage", false);
  //preferences.putInt("cont", 0);
  
  // Configuração da nomenclatura dos arquivos salvos
  preferences.putInt("cont", preferences.getInt("cont", 0) + 1);
  pathSave = "/lancamento_" + String(preferences.getInt("cont", 0)) + ".txt";
  
  while(true){
    onReceive();
    delay(60);
    packet_send();
    delay(10);
    
  }
}

byte get_checksum_struct(bool op){
  byte checksum = 0;
  if(op){
    for(int i=0; i<sizeof(packet_DATA.data_byte-1); i++){
      checksum ^= packet_DATA.data_byte[i];
    }
  }else{
    for(int i=0; i<sizeof(packet_COMMAND.data_byte-1); i++){
      checksum ^= packet_COMMAND.data_byte[i];
    }
  }
  return (255-checksum);
}

void packet_send(){
    // Calcula o checksum para os dados na estrutura packet_COMMAND
    packet_COMMAND.data.checksum = get_checksum_struct(false);
    // Exibe informações de depuração sobre os comandos a serem enviados
    Serial.println("Comandos enviados :"+String( packet_COMMAND.data.checksum));
    Serial.println("calib:"+String(packet_COMMAND.data.calib));
    Serial.println("reset :"+String(packet_COMMAND.data.reset_));
    Serial.println("coleta :"+String(packet_COMMAND.data.reset_));
    Serial.println("eject_m :"+String(packet_COMMAND.data.eject_m));
    LoRa.beginPacket(); // Inicia a transmissão do pacote LoRa
    // Escreve os bytes dos dados do comando no pacote LoRa
    LoRa.write((uint8_t*)&packet_COMMAND.data_byte, sizeof(packet_COMMAND.data_byte));
    LoRa.endPacket(); // Finaliza o pacote LoRa
    
    // Limpa os comandos após o envio
    packet_COMMAND.data.calib=0;
    packet_COMMAND.data.eject_m=0;
    packet_COMMAND.data.reset_=0;
}
void onReceive(){
  long times=millis(); // Captura o tempo atual em milissegundos
  while(!LoRa.parsePacket() and !LoRa.available()){ 
    // Aguarda até que um pacote LoRa seja recebido ou até que um certo tempo tenha passado
    if ((millis()-times) >= 520) { // Verifica se o tempo de espera excedeu 520 milissegundos
      Serial.println(millis()-times); // Se sim, imprime a diferença de tempo para depuração
      return;
    }
  }
  // Lê os bytes do pacote LoRa e os armazena na estrutura packet_DATA
  LoRa.readBytes((uint8_t*)&packet_DATA.data, sizeof(packet_DATA.data)); 
  if(get_checksum_struct(true) == packet_DATA.data.checksum){ // Verifica se o checksum dos dados recebidos é igual ao checksum calculado    
    // dataFile = SD.open(pathSave, FILE_APPEND);
      Serial.println("-Dados recebidos-");
      packetSNR = LoRa.packetSnr(); // Armazena o sinal-ruído do pacote LoRa na variável packetSNR

//      if(dataFile){
//         dataFile.println("\""+String(packet_DATA.data.times) + "\", \"" + String(packet_DATA.data.status_eject)+ "\", \"" + String(packet_DATA.data.bmp_alt_calib)+ "\", \"" + String(packet_DATA.data.bmp_pre)+ "\", \"" + String(packet_DATA.data.mpu_Ax)+ "\", \"" +String(packet_DATA.data.mpu_Ay)+ "\", \"" +String(packet_DATA.data.mpu_Az)+ "\", \"" +String(packet_DATA.data.mpu_Gx)+ "\", \"" +String(packet_DATA.data.mpu_Gy)+ "\", \"" +String(packet_DATA.data.mpu_Gz)+"\"");  
//      }
     // dataFile.close();
    
  }else{
    Serial.println("-Dados recebidos: checksom negativo-");
  }
 
}
