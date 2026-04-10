/**
 * FleetGuard — ESP32 telemetry (HTTPS only in production)
 *
 * Full URL to telemetry endpoint + shared ingest key (must match TELEMETRY_INGEST_KEY on the server).
 * Library: ArduinoJson (Library Manager)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// Full HTTPS URL including path (Render / Railway)
const char* serverUrl = "https://your-backend.onrender.com/api/telemetry";
const char* apiKey = "supersecret123";

const char* DEVICE_ID = "ESP32-DEMO-001";

unsigned long lastSend = 0;
unsigned long intervalMs = 5000;

void setup() {
  Serial.begin(115200);
  delay(300);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();
  Serial.println(WiFi.localIP());
  randomSeed(esp_random());
}

bool postTelemetry() {
  float cpu = 15.0f + (random(0, 700) / 10.0f);
  float latency = 20.0f + (random(0, 1800) / 10.0f);

  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["cpu"] = cpu;
  doc["latency"] = latency;

  String body;
  serializeJson(doc, body);

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-FleetGuard-Telemetry-Key", apiKey);

  int code = http.POST(body);
  Serial.printf("POST telemetry -> %d\n", code);
  if (code > 0) {
    Serial.println(http.getString());
  } else {
    Serial.println(http.errorToString(code));
  }
  http.end();
  return code > 0;
}

void loop() {
  unsigned long now = millis();
  if (now - lastSend < intervalMs) {
    delay(20);
    return;
  }
  lastSend = now;
  intervalMs = 5000 + (unsigned long)random(0, 5001);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi reconnecting...");
    WiFi.reconnect();
    delay(500);
    return;
  }

  postTelemetry();
}
