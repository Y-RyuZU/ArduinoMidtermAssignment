// ============================================================================
// LED Animation Controller for Arduino
// Features: Web server, CORS support, custom easing, bezier curves, wave effects
// ============================================================================

#include <WiFiS3.h>
#include <Adafruit_NeoPixel.h>
#include <ArduinoJson.h>

// WiFi設定
const char* ssid = "aterm-1b6e68-g";
const char* password = "97daed1c2e3ae";

#define LED_PIN 4
#define LED_COUNT 4

// ============================================================================
// Data Structures
// ============================================================================
struct BezierCurve {
  float x1, y1, x2, y2;
};

// ============================================================================
// HTTP Response Functions
// ============================================================================

// ============================================================================
// Status and Response Functions
// ============================================================================

// ============================================================================
// LED Animation Functions
// ============================================================================

// ============================================================================
// Easing Functions
// ============================================================================

// ============================================================================
// Animation Control Functions
// ============================================================================;

struct AnimationConfig {
  uint32_t color1;        // 開始色
  uint32_t color2;        // 終了色
  int duration;           // アニメーション時間（ミリ秒）
  String easingType;      // イージング関数の種類
  BezierCurve bezier;     // カスタムベジェ曲線
  float waveDelay;        // 波の時間差（0.0-1.0、durationに対する比率）
  bool isRunning;         // アニメーション実行中フラグ
  unsigned long startTime; // アニメーション開始時刻
};

// ============================================================================
// Global Variables
// ============================================================================
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);
WiFiServer server(80);

AnimationConfig currentAnimation = {
  strip.Color(255, 0, 0),    // 赤
  strip.Color(0, 0, 255),    // 青
  3000,                      // 3秒
  "easeInOut",               // デフォルトイージング
  {0.25, 0.1, 0.25, 1.0},    // デフォルトベジェ曲線
  0.25,                      // デフォルト波の時間差（25%）
  false,                     // 停止状態
  0                          // 開始時刻
};

// ============================================================================
// Setup and Main Loop
// ============================================================================

void setup() {
  Serial.begin(9600);
  while (!Serial);

  // LED初期化
  strip.begin();
  strip.show();
  strip.setBrightness(50);

  // WiFi接続
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println("\nConnected to WiFi");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Webサーバー開始
  server.begin();
  Serial.println("Web server started");
}

void loop() {
  handleWebClient();
  updateAnimation();
  delay(10); // CPUの負荷軽減
}

// ============================================================================
// Web Server Functions
// ============================================================================

void handleWebClient() {
  WiFiClient client = server.available();
  if (!client) return;

  String request = "";
  String headers = "";
  
  // リクエストヘッダーを読み取り
  while (client.connected() && client.available()) {
    String line = client.readStringUntil('\n');
    if (line == "\r") break;
    if (request == "") request = line;
    headers += line + "\n";
  }

  Serial.println("Request: " + request);

  // OPTIONSリクエスト（プリフライト）の処理
  if (request.indexOf("OPTIONS") >= 0) {
    sendCORSResponse(client);
    client.stop();
    return;
  }

  // APIエンドポイントの処理
  if (request.indexOf("GET /api/start") >= 0) {
    startAnimation();
    sendJSONResponse(client, "{\"status\":\"started\"}");
  }
  else if (request.indexOf("GET /api/stop") >= 0) {
    stopAnimation();
    sendJSONResponse(client, "{\"status\":\"stopped\"}");
  }
  else if (request.indexOf("POST /api/config") >= 0) {
    String body = readRequestBody(client);
    if (parseConfig(body)) {
      sendJSONResponse(client, "{\"status\":\"configured\"}");
    } else {
      sendJSONResponse(client, "{\"status\":\"error\",\"message\":\"invalid config\"}");
    }
  }
  else if (request.indexOf("GET /api/status") >= 0) {
    String status = getStatus();
    sendJSONResponse(client, status);
  }
  else if (request.indexOf("GET /") >= 0) {
    sendHTMLResponse(client);
  }
  else {
    send404Response(client);
  }

  client.stop();
}

// ============================================================================
// JSON Parsing Functions
// ============================================================================

String readRequestBody(WiFiClient& client) {
  String body = "";
  while (client.available()) {
    body += client.readString();
  }
  return body;
}

bool parseConfig(String json) {
  // ArduinoJsonを使用した正確なJSON解析
  StaticJsonDocument<512> doc;
  
  DeserializationError error = deserializeJson(doc, json);
  if (error) {
    Serial.print("JSON parsing failed: ");
    Serial.println(error.c_str());
    return false;
  }

  // 各フィールドの解析
  if (doc.containsKey("color1")) {
    String color1Str = doc["color1"];
    currentAnimation.color1 = hexToColor(color1Str);
    Serial.println("Color1 updated: " + color1Str);
  }

  if (doc.containsKey("color2")) {
    String color2Str = doc["color2"];
    currentAnimation.color2 = hexToColor(color2Str);
    Serial.println("Color2 updated: " + color2Str);
  }

  if (doc.containsKey("duration")) {
    currentAnimation.duration = doc["duration"];
    Serial.println("Duration updated: " + String(currentAnimation.duration));
  }

  if (doc.containsKey("easing")) {
    currentAnimation.easingType = doc["easing"].as<String>();
    Serial.println("Easing updated: " + currentAnimation.easingType);
  }

  if (doc.containsKey("bezier")) {
    String bezierStr = doc["bezier"];
    parseBezier(bezierStr);
  }

  if (doc.containsKey("waveDelay")) {
    currentAnimation.waveDelay = doc["waveDelay"];
    // 0.0-1.0の範囲に制限
    if (currentAnimation.waveDelay < 0.0) currentAnimation.waveDelay = 0.0;
    if (currentAnimation.waveDelay > 1.0) currentAnimation.waveDelay = 1.0;
    Serial.println("Wave delay updated: " + String(currentAnimation.waveDelay));
  }

  return true;
}

// ============================================================================
// Color and Utility Functions
// ============================================================================

uint32_t hexToColor(String hex) {
  hex.replace("#", "");
  
  long number = strtol(hex.c_str(), NULL, 16);
  int r = (number >> 16) & 0xFF;
  int g = (number >> 8) & 0xFF;
  int b = number & 0xFF;
  
  return strip.Color(r, g, b);
}

void parseBezier(String bezierStr) {
  // "cubic-bezier(0.25, 0.1, 0.25, 1.0)" の形式を解析
  bezierStr.replace("cubic-bezier(", "");
  bezierStr.replace(")", "");
  
  // カンマで分割して4つのパラメータを取得
  int commaPos[3];
  int commaCount = 0;
  
  for (int i = 0; i < bezierStr.length() && commaCount < 3; i++) {
    if (bezierStr.charAt(i) == ',') {
      commaPos[commaCount] = i;
      commaCount++;
    }
  }
  
  if (commaCount == 3) {
    String x1Str = bezierStr.substring(0, commaPos[0]);
    String y1Str = bezierStr.substring(commaPos[0] + 1, commaPos[1]);
    String x2Str = bezierStr.substring(commaPos[1] + 1, commaPos[2]);
    String y2Str = bezierStr.substring(commaPos[2] + 1);
    
    x1Str.trim();
    y1Str.trim();
    x2Str.trim();
    y2Str.trim();
    
    currentAnimation.bezier.x1 = x1Str.toFloat();
    currentAnimation.bezier.y1 = y1Str.toFloat();
    currentAnimation.bezier.x2 = x2Str.toFloat();
    currentAnimation.bezier.y2 = y2Str.toFloat();
    
    Serial.println("Bezier curve updated: " + 
                   String(currentAnimation.bezier.x1) + ", " +
                   String(currentAnimation.bezier.y1) + ", " +
                   String(currentAnimation.bezier.x2) + ", " +
                   String(currentAnimation.bezier.y2));
  }
}

void startAnimation() {
  currentAnimation.isRunning = true;
  currentAnimation.startTime = millis();
  Serial.println("Animation started");
}

void stopAnimation() {
  currentAnimation.isRunning = false;
  // 全LEDを消灯
  for (int i = 0; i < LED_COUNT; i++) {
    strip.setPixelColor(i, strip.Color(0, 0, 0));
  }
  strip.show();
  Serial.println("Animation stopped");
}

void updateAnimation() {
  if (!currentAnimation.isRunning) return;

  unsigned long elapsed = millis() - currentAnimation.startTime;
  
  // バウンド（往復）アニメーションのため、総時間を2倍にする
  unsigned long totalDuration = (currentAnimation.duration + (currentAnimation.duration * currentAnimation.waveDelay)) * 2;
  
  if (elapsed >= totalDuration) {
    elapsed = totalDuration;
  }

  // 進行度を計算（0.0 - 2.0の範囲、往復のため）
  float progress = (float)elapsed / totalDuration * 2.0;
  
  // 波アニメーション適用
  applyGradient(progress);
  
  // アニメーション終了処理
  if (elapsed >= totalDuration) {
    currentAnimation.startTime = millis(); // ループ再生
  }
}

float applyEasing(float t, String easingType) {
  if (easingType == "linear") {
    return t;
  }
  else if (easingType == "easeIn") {
    return t * t;
  }
  else if (easingType == "easeOut") {
    return 1 - (1 - t) * (1 - t);
  }
  else if (easingType == "easeInOut") {
    return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
  }
  else if (easingType == "easeInQuad") {
    return t * t;
  }
  else if (easingType == "easeOutQuad") {
    return 1 - (1 - t) * (1 - t);
  }
  else if (easingType == "easeInOutQuad") {
    return t < 0.5 ? 2 * t * t : 1 - pow(-2 * t + 2, 2) / 2;
  }
  else if (easingType == "easeInCubic") {
    return t * t * t;
  }
  else if (easingType == "easeOutCubic") {
    return 1 - pow(1 - t, 3);
  }
  else if (easingType == "easeInOutCubic") {
    return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
  }
  else if (easingType == "bounce") {
    if (t < 1/2.75) {
      return 7.5625 * t * t;
    } else if (t < 2/2.75) {
      t -= 1.5/2.75;
      return 7.5625 * t * t + 0.75;
    } else if (t < 2.5/2.75) {
      t -= 2.25/2.75;
      return 7.5625 * t * t + 0.9375;
    } else {
      t -= 2.625/2.75;
      return 7.5625 * t * t + 0.984375;
    }
  }
  else if (easingType == "bezier") {
    return cubicBezier(t, currentAnimation.bezier);
  }
  return t; // デフォルトはlinear
}

// ============================================================================
// Bezier Curve Functions
// ============================================================================

// 3次ベジェ曲線の計算
float cubicBezier(float t, BezierCurve curve) {
  // ニュートン・ラプソン法でtに対応するベジェ曲線上のx値を求める
  float x = solveBezierX(t, curve);
  
  // 求めたxに対応するy値を計算
  return bezierY(x, curve);
}

// ベジェ曲線のX値を逆算（ニュートン・ラプソン法）
float solveBezierX(float t, BezierCurve curve) {
  float x = t; // 初期推定値
  
  for (int i = 0; i < 8; i++) { // 8回の反復で十分な精度
    float fx = bezierX(x, curve) - t;
    float dfx = bezierXDerivative(x, curve);
    
    if (abs(dfx) < 1e-6) break; // 微分がゼロに近い場合は終了
    
    x = x - fx / dfx;
    
    // 範囲を[0, 1]に制限
    if (x < 0) x = 0;
    if (x > 1) x = 1;
  }
  
  return x;
}

// ベジェ曲線のX座標計算
float bezierX(float t, BezierCurve curve) {
  float invT = 1 - t;
  return 3 * invT * invT * t * curve.x1 + 
         3 * invT * t * t * curve.x2 + 
         t * t * t;
}

// ベジェ曲線のY座標計算
float bezierY(float t, BezierCurve curve) {
  float invT = 1 - t;
  return 3 * invT * invT * t * curve.y1 + 
         3 * invT * t * t * curve.y2 + 
         t * t * t;
}

// ベジェ曲線X座標の微分
float bezierXDerivative(float t, BezierCurve curve) {
  float invT = 1 - t;
  return 3 * invT * invT * curve.x1 + 
         6 * invT * t * (curve.x2 - curve.x1) + 
         3 * t * t * (1 - curve.x2);
}

void applyGradient(float progress) {
  // 各LEDに時間差を付けて波のようなアニメーション
  for (int i = 0; i < LED_COUNT; i++) {
    // 各LEDの時間差を計算（設定可能なwaveDelayを使用）
    float ledDelay = (float)i / (LED_COUNT - 1) * currentAnimation.waveDelay;
    
    // 各LEDの個別進行度を計算
    float ledProgress = progress - ledDelay;
    
    // 進行度を0-2の範囲でループさせる（往復のため2倍）
    ledProgress = fmod(ledProgress, 2.0);
    if (ledProgress < 0) {
      ledProgress += 2.0; // 負の値を正に変換
    }
    
    // 往復バウンドの計算
    float bounceProgress;
    if (ledProgress <= 1.0) {
      // 前半：0→1（通常の進行）
      bounceProgress = ledProgress;
    } else {
      // 後半：1→0（逆方向、同じイージングを適用）
      bounceProgress = 2.0 - ledProgress; // 2-1.5=0.5, 2-1.2=0.8
    }
    
    // イージングを適用
    float easedProgress = applyEasing(bounceProgress, currentAnimation.easingType);
    
    // 色の補間計算
    uint8_t r1 = (currentAnimation.color1 >> 16) & 0xFF;
    uint8_t g1 = (currentAnimation.color1 >> 8) & 0xFF;
    uint8_t b1 = currentAnimation.color1 & 0xFF;
    
    uint8_t r2 = (currentAnimation.color2 >> 16) & 0xFF;
    uint8_t g2 = (currentAnimation.color2 >> 8) & 0xFF;
    uint8_t b2 = currentAnimation.color2 & 0xFF;
    
    uint8_t r = r1 + (r2 - r1) * easedProgress;
    uint8_t g = g1 + (g2 - g1) * easedProgress;
    uint8_t b = b1 + (b2 - b1) * easedProgress;
    
    uint32_t color = strip.Color(r, g, b);
    
    // 各LEDに個別の色を設定
    strip.setPixelColor(i, color);
  }
  
  strip.show();
}

String getStatus() {
  StaticJsonDocument<256> doc;
  
  doc["isRunning"] = currentAnimation.isRunning;
  doc["duration"] = currentAnimation.duration;
  doc["easing"] = currentAnimation.easingType;
  doc["waveDelay"] = currentAnimation.waveDelay;
  
  // ベジェ曲線の情報を追加
  JsonObject bezier = doc.createNestedObject("bezier");
  bezier["x1"] = currentAnimation.bezier.x1;
  bezier["y1"] = currentAnimation.bezier.y1;
  bezier["x2"] = currentAnimation.bezier.x2;
  bezier["y2"] = currentAnimation.bezier.y2;
  
  // 色を16進数で追加
  char color1Hex[8], color2Hex[8];
  sprintf(color1Hex, "#%06X", currentAnimation.color1);
  sprintf(color2Hex, "#%06X", currentAnimation.color2);
  
  doc["color1"] = color1Hex;
  doc["color2"] = color2Hex;
  
  String output;
  serializeJson(doc, output);
  return output;
}

void sendJSONResponse(WiFiClient& client, String json) {
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("Access-Control-Allow-Origin: *");
  client.println("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
  client.println("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
  client.println("Access-Control-Max-Age: 86400");
  client.println("Connection: close");
  client.println();
  client.println(json);
}

void sendCORSResponse(WiFiClient& client) {
  client.println("HTTP/1.1 200 OK");
  client.println("Access-Control-Allow-Origin: *");
  client.println("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
  client.println("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
  client.println("Access-Control-Max-Age: 86400");
  client.println("Content-Length: 0");
  client.println("Connection: close");
  client.println();
}

void sendHTMLResponse(WiFiClient& client) {
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("Access-Control-Allow-Origin: *");
  client.println("Connection: close");
  client.println();
  
  client.println("<!DOCTYPE html>");
  client.println("<html><head><title>LED Controller</title></head>");
  client.println("<body>");
  client.println("<h1>LED Tape Controller (4 LEDs Bounce Wave Animation)</h1>");
  client.println("<p>4つのLEDが波のように時間差でバウンド（往復）アニメーションします</p>");
  client.println("<h2>API Endpoints:</h2>");
  client.println("<ul>");
  client.println("<li>GET /api/start - Start animation</li>");
  client.println("<li>GET /api/stop - Stop animation</li>");
  client.println("<li>POST /api/config - Configure animation (JSON)</li>");
  client.println("<li>GET /api/status - Get current status</li>");
  client.println("</ul>");
  client.println("<h2>Example Config JSON:</h2>");
  client.println("<pre>{");
  client.println("  \"color1\": \"#FF0000\",");
  client.println("  \"color2\": \"#0000FF\",");
  client.println("  \"duration\": 3000,");
  client.println("  \"easing\": \"easeInOutCubic\",");
  client.println("  \"waveDelay\": 0.25");
  client.println("}</pre>");
  client.println("<h3>Custom Bezier Example:</h3>");
  client.println("<pre>{");
  client.println("  \"color1\": \"#00FF00\",");
  client.println("  \"color2\": \"#FF00FF\",");
  client.println("  \"duration\": 4000,");
  client.println("  \"easing\": \"bezier\",");
  client.println("  \"bezier\": \"cubic-bezier(0.25, 0.1, 0.25, 1)\",");
  client.println("  \"waveDelay\": 0.3");
  client.println("}</pre>");
  client.println("<h2>Wave Delay Examples:</h2>");
  client.println("<ul>");
  client.println("<li>0.0 - 全LEDが同時にアニメーション（波効果なし）</li>");
  client.println("<li>0.1 - 短い時間差（素早い波）</li>");
  client.println("<li>0.25 - 標準的な波（デフォルト）</li>");
  client.println("<li>0.5 - ゆっくりとした波</li>");
  client.println("<li>1.0 - 最大時間差（非常にゆっくりした波）</li>");
  client.println("</ul>");
  client.println("<h2>Available Easing Types:</h2>");
  client.println("<ul>");
  client.println("<li>linear</li>");
  client.println("<li>easeIn</li>");
  client.println("<li>easeOut</li>");
  client.println("<li>easeInOut</li>");
  client.println("<li>bounce</li>");
  client.println("<li>bezier (requires bezier parameter)</li>");
  client.println("</ul>");
  client.println("</body></html>");
}

void send404Response(WiFiClient& client) {
  client.println("HTTP/1.1 404 Not Found");
  client.println("Content-Type: text/plain");
  client.println("Access-Control-Allow-Origin: *");
  client.println("Connection: close");
  client.println();
  client.println("404 - Page not found");
}