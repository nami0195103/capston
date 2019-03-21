#include <ESP8266WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define myPeriodic 60 //in sec | Thingspeak pub is 60sec
#define ONE_WIRE_BUS 2  // DS18B20 on arduino pin2 corresponds to D4 on physical board

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature DS18B20(&oneWire);
float prevTemp = 0;

const char* server = "api.thingspeak.com";
String apiKey ="thingspeak API";      //should be changed!!!
const char* MY_SSID = "wifi SSID";    //should be changed!!!
const char* MY_PWD = "wifi pwd";      //should be changed!!!
int sent = 0;

const char* aws = "3.18.106.19";

void setup() {
  Serial.begin(115200);
  connectWifi();

  DS18B20.begin();
}

void loop() {
  float temp;
  DS18B20.requestTemperatures(); 
  temp = DS18B20.getTempCByIndex(0);
  Serial.print(String(sent)+" Temperature: ");
  Serial.println(temp);
  
  sendTeperatureTS(temp);
  sendTeperatureAws(temp);
  int count = myPeriodic;
  while(count--)
  delay(1000);
}

void connectWifi()
{
  Serial.print("Connecting to "+*MY_SSID);
  WiFi.begin(MY_SSID, MY_PWD);
  while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  Serial.print(".");
  }

  Serial.println("");
  Serial.println("Connected");
  Serial.println("");  
}//end connect

void sendTeperatureTS(float temp)
{  
   WiFiClient client;
  
   if (client.connect(server, 80)) { // use ip 184.106.153.149 or api.thingspeak.com
   Serial.println("WiFi Client connected to TS ");
   
   String postStr = apiKey;
   postStr += "&field1=";
   postStr += String(temp);
   postStr += "\r\n\r\n";
   
   client.print("POST /update HTTP/1.1\n");
   client.print("Host: api.thingspeak.com\n");
   client.print("Connection: close\n");
   client.print("X-THINGSPEAKAPIKEY: " + apiKey + "\n");
   client.print("Content-Type: application/x-www-form-urlencoded\n");
   client.print("Content-Length: ");
   client.print(postStr.length());
   client.print("\n\n");
   client.print(postStr);
   delay(1000);
   
   }//end if
   sent++;
 client.stop();
}//end send

void sendTeperatureAws(float temp)
{  
   WiFiClient client;
  
   if (client.connect(aws, 8000)) { // connect to aws server
   Serial.println("WiFi Client connected to AWS");

   //String postStr = aws;
   //postStr += ":8000/log?value=";
   String postStr = "value=";
   postStr += String(temp);
   postStr += "&type=T&device=1";
   postStr += "\r\n\r\n";
   client.print("GET /log?");
   client.print(postStr);
   client.println(" HTTP/1.1");
   client.print("Host:  http://");
   client.print(aws);
   client.println(":8000\nConnection: close\n");
   delay(1000);
   
   }//end if
 client.stop();
}//end send
