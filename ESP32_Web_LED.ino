// 新增頁面路由處理函數
void handleDashboard() {
  String html = processHTMLTemplate("/index.html");
  server.send(200, "text/html", html);
}

void handleSettings() {
  String html = processHTMLTemplate("/settings.html");
  server.send(200, "text/html", html);
}

void handleStatistics() {
  String html = processHTMLTemplate("/statistics.html");
  server.send(200, "text/html", html);
}

void handleSystemInfo() {
  String html = processHTMLTemplate("/system.html");
  server.send(200, "text/html", html);
}

// 更新 initializeWebServer() 函數
void initializeWebServer() {
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
  server.on("/api/bulb/status", HTTP_GET, handleBulbStatus);
  server.on("/api/system/info", HTTP_GET, handleSystemInfoAPI);
  
  // 404 處理
  server.onNotFound(handleNotFound);
  
  server.begin();
  Serial.println("🚀 HTTP 伺服器已啟動");
}

// 新增系統資訊 API
void handleSystemInfoAPI() {
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
  doc["system"]["restart_reason"] = ESP.getResetReason();
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}