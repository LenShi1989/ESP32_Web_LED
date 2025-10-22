/*
 * ESP32 Web Server LED 控制 - SPIFFS 專業版
 * 使用模組化設計，適合大型專案
 */

#include <WiFi.h>
#include <WebServer.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>

// ========== 設定區 ==========
// 網路設定
const char *ssid = "TP-LINK_123BF4";
const char *password = "04518280";

// 裝置設定
const int ledPin = 2;
bool ledState = false;

// Web 伺服器
WebServer server(80);

// ========== 函式宣告 ==========
bool initializeSPIFFS();
bool initializeWiFi();
void initializeWebServer();
String processHTMLTemplate(const String &filePath);
void handleAPIRequest();

// ========== Web 路由處理 ==========
void handleRoot()
{
  String html = processHTMLTemplate("/index.html");
  server.send(200, "text/html", html);
}

void handleCSS()
{
  File file = SPIFFS.open("/style.css", "r");
  if (file)
  {
    server.streamFile(file, "text/css");
    file.close();
  }
  else
  {
    server.send(404, "text/plain", "CSS file not found");
  }
}

void handleJS()
{
  File file = SPIFFS.open("/script.js", "r");
  if (file)
  {
    server.streamFile(file, "application/javascript");
    file.close();
  }
  else
  {
    server.send(404, "text/plain", "JS file not found");
  }
}

void handleFavicon()
{
  File file = SPIFFS.open("/favicon.ico", "r");
  if (file)
  {
    server.streamFile(file, "image/x-icon");
    file.close();
  }
  else
  {
    server.send(404, "text/plain", "Favicon not found");
  }
}

// API 端點
void handleLEDOn()
{
  digitalWrite(ledPin, HIGH);
  ledState = true;

  // 回傳 JSON 回應
  DynamicJsonDocument doc(256);
  doc["status"] = "success";
  doc["message"] = "LED 已開啟";
  doc["led_state"] = ledState;

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleLEDOff()
{
  digitalWrite(ledPin, LOW);
  ledState = false;

  DynamicJsonDocument doc(256);
  doc["status"] = "success";
  doc["message"] = "LED 已關閉";
  doc["led_state"] = ledState;

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleLEDToggle()
{
  ledState = !ledState;
  digitalWrite(ledPin, ledState ? HIGH : LOW);

  DynamicJsonDocument doc(256);
  doc["status"] = "success";
  doc["message"] = ledState ? "LED 已開啟" : "LED 已關閉";
  doc["led_state"] = ledState;

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleGetStatus()
{
  DynamicJsonDocument doc(256);
  doc["status"] = "success";
  doc["led_state"] = ledState;
  doc["free_heap"] = ESP.getFreeHeap();
  doc["wifi_rssi"] = WiFi.RSSI();

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleNotFound()
{
  String message = "檔案未找到: " + server.uri();
  server.send(404, "text/plain", message);
}

// ========== 核心函式 ==========
bool initializeSPIFFS()
{
  if (!SPIFFS.begin(true))
  {
    Serial.println("❌ SPIFFS 初始化失敗!");
    return false;
  }

  // 列出所有檔案（除錯用）
  Serial.println("📁 SPIFFS 檔案列表:");
  File root = SPIFFS.open("/");
  File file = root.openNextFile();
  while (file)
  {
    Serial.printf("  📄 %s (大小: %d bytes)\n", file.name(), file.size());
    file = root.openNextFile();
  }
  Serial.println();

  return true;
}

bool initializeWiFi()
{
  Serial.printf("📶 正在連接到 Wi-Fi: %s", ssid);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20)
  {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("\n✅ Wi-Fi 連接成功!");
    Serial.printf("📡 IP 地址: http://%s\n", WiFi.localIP().toString().c_str());
    Serial.printf("📡 訊號強度: %d dBm\n", WiFi.RSSI());
    return true;
  }
  else
  {
    Serial.println("\n❌ Wi-Fi 連接失敗!");
    return false;
  }
}

// 新增頁面路由處理函數
void handleDashboard()
{
  String html = processHTMLTemplate("/index.html");
  server.send(200, "text/html", html);
}

void handleSettings()
{
  String html = processHTMLTemplate("/settings.html");
  server.send(200, "text/html", html);
}

void handleStatistics()
{
  String html = processHTMLTemplate("/statistics.html");
  server.send(200, "text/html", html);
}

void handleSystemInfo()
{
  String html = processHTMLTemplate("/system.html");
  server.send(200, "text/html", html);
}

//  在 initializeWebServer() 函數中新增路由
void initializeWebServer()
{
  // 靜態檔案服務
  server.on("/", HTTP_GET, handleDashboard);
  server.on("/dashboard", HTTP_GET, handleDashboard);
  server.on("/settings", HTTP_GET, handleSettings);
  server.on("/statistics", HTTP_GET, handleStatistics);
  server.on("/system", HTTP_GET, handleSystemInfo);
  server.on("/style.css", HTTP_GET, handleCSS);
  server.on("/script.js", HTTP_GET, handleJS);
  server.on("/favicon.ico", HTTP_GET, handleFavicon);

  // API 端點
  server.on("/api/led/on", HTTP_POST, handleLEDOn);
  server.on("/api/led/off", HTTP_POST, handleLEDOff);
  server.on("/api/led/toggle", HTTP_POST, handleLEDToggle);
  server.on("/api/status", HTTP_GET, handleGetStatus);
  server.on("/api/bulb/status", HTTP_GET, handleBulbStatus); // 新增燈泡狀態 API
  server.on("/api/system/info", HTTP_GET, handleSystemInfoAPI);

  // 404 處理
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("🚀 HTTP 伺服器已啟動");
}

String processHTMLTemplate(const String &filePath)
{
  File file = SPIFFS.open(filePath, "r");
  if (!file)
  {
    return "❌ 錯誤: 無法開啟 " + filePath;
  }

  String html = file.readString();
  file.close();

  // 模板變數替換
  html.replace("{{DEVICE_NAME}}", "ESP32 智能燈泡控制器");
  html.replace("{{LED_STATE}}", ledState ? "開啟" : "關閉");
  html.replace("{{LED_COLOR}}", ledState ? "green" : "red");
  html.replace("{{IP_ADDRESS}}", WiFi.localIP().toString());
  html.replace("{{FREE_HEAP}}", String(ESP.getFreeHeap()));
  html.replace("{{BULB_GLOW}}", ledState ? "bulb-on" : "bulb-off");
  html.replace("{{STATUS_TEXT}}", ledState ? "💡 燈泡亮起中" : "⚫ 燈泡已關閉");

  return html;
}

// 在原有的 API 端點後新增以下函數
void handleBulbStatus()
{
  DynamicJsonDocument doc(256);
  doc["status"] = "success";
  doc["led_state"] = ledState;
  doc["bulb_color"] = ledState ? "#ffd700" : "#666666";
  doc["bulb_glow"] = ledState ? "bulb-on" : "bulb-off";
  doc["status_text"] = ledState ? "燈泡亮起" : "燈泡熄滅";

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

String getResetReasonString(esp_reset_reason_t reason)
{
  switch (reason)
  {
  case ESP_RST_UNKNOWN:
    return "Unknown";
  case ESP_RST_POWERON:
    return "Power on";
  case ESP_RST_EXT:
    return "External reset";
  case ESP_RST_SW:
    return "Software reset";
  case ESP_RST_PANIC:
    return "Panic/exception";
  case ESP_RST_INT_WDT:
    return "Interrupt watchdog";
  case ESP_RST_TASK_WDT:
    return "Task watchdog";
  case ESP_RST_WDT:
    return "Other watchdog";
  case ESP_RST_DEEPSLEEP:
    return "Deep sleep";
  case ESP_RST_BROWNOUT:
    return "Brownout";
  case ESP_RST_SDIO:
    return "SDIO";
  default:
    return "No reason";
  }
}

// 新增系統資訊 API
void handleSystemInfoAPI()
{
  DynamicJsonDocument doc(512);
  doc["status"] = "success";
  doc["device"]["chip_model"] = ESP.getChipModel();
  doc["device"]["cpu_freq"] = ESP.getCpuFreqMHz();
  doc["device"]["flash_size"] = ESP.getFlashChipSize();
  doc["device"]["sdk_version"] = ESP.getSdkVersion();

  doc["memory"]["free_heap"] = ESP.getFreeHeap();
  doc["memory"]["min_free_heap"] = ESP.getMinFreeHeap();
  doc["memory"]["max_alloc_heap"] = ESP.getMaxAllocHeap();

  doc["wifi"]["ssid"] = WiFi.SSID();
  doc["wifi"]["rssi"] = WiFi.RSSI();
  doc["wifi"]["ip"] = WiFi.localIP().toString();
  doc["wifi"]["mac"] = WiFi.macAddress();

  doc["system"]["uptime"] = millis();
  doc["system"]["restart_reason"] = getResetReasonString(esp_reset_reason());

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

// ========== Arduino 主程式 ==========
void setup()
{
  Serial.begin(115200);
  Serial.println("\n🔧 ESP32 Web LED Controller - SPIFFS Version");
  Serial.println("===========================================");

  // 初始化硬體
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  // 初始化系統
  if (!initializeSPIFFS())
    return;
  if (!initializeWiFi())
    return;
  initializeWebServer();

  Serial.println("✅ 系統初始化完成!");
}

void loop()
{
  server.handleClient();
  // 這裡可以加入其他背景任務
}
