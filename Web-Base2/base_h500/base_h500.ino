#include <LoRa.h> 
#include <SPI.h> 
#include <WiFi.h> 
#include <AsyncTCP.h> 
#include <ESPAsyncWebServer.h> 
#include "FS.h" 
#include "SD.h" 
#include "SPIFFS.h" 
#include <Preferences.h> 

#define LORA_SSBW 125E3
#define LORA_SF 8
#define LORA_CR 5 
#define LORA_PREAMBLE_LEN 8
#define LORA_SYNC_WORD 0xA5
#define LORA_BAND 433E6

#define rst 27
#define dio0 2
#define HSPI_MISO   12
#define HSPI_MOSI   13
#define HSPI_SCLK   14
#define HSPI_SS     15

static uint8_t CoreZero = 0;
static uint8_t CoreOne  = 1;
const char* ssid = "Avionica";
const char* password = "123456789";
long time_step=0;     // Variável para armazenar o tempo
String pathSave;      // Caminho para salvar o arquivo no cartão SD
File dataFile;        // Objeto de arquivo para manipulação de arquivos
float packetSNR = 0;  // Sinal-ruído do pacote LoRa
 
AsyncWebServer server(80); // Criação do servidor web assíncrono na porta 80
AsyncWebSocket ws("/ws");  // Criação do WebSocket assíncrono com o caminho /ws
Preferences preferences;   // Objeto de preferências para armazenamento persistente

// Definição da estrutura de dados para os pacotes de informação
union packet_data {
  struct data {
    unsigned long times;
    int status_eject;
    float bmp_temp;
    float bmp_alt_calib;
    float bmp_alt;
    float bmp_pre;
    float mpu_Ax;
    float mpu_Ay;
    float mpu_Az;
    float mpu_Gx;
    float mpu_Gy;
    float mpu_Gz;
    float snr;
    byte checksum;
   }data;
   byte data_byte[sizeof(data)];
};

// Definição da estrutura de dados para os pacotes de comando
union packet_command {
  struct data {
    int coleta;
    int calib;
    int reset_;
    int eject_m;
    byte checksum;
  }data;
  byte data_byte[sizeof(data)];
};

// Declaração das variáveis globais para os pacotes de informação e comando
union packet_data packet_DATA;
union packet_command packet_COMMAND;

float accTotal;

void setup() {
  Serial.begin(115200);
  xTaskCreatePinnedToCore(loopCore0,"coreTaskZero",10000,NULL,1, NULL,CoreZero);                  
  delay(500);
  xTaskCreatePinnedToCore(loopCore1,"coreTaskZero",10000,NULL,1, NULL,CoreOne);                  
  delay(500);

}

void loop() { }
