<?php
// =============================================================================
// Koochify Zibal Payment Gateway Proxy
// Place this file on your Iranian cPanel / DirectAdmin host (e.g. proxy.koochify.ir)
// in the public_html directory.
// =============================================================================

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, X-Proxy-Token");

// 1. Verify Secret Token
$headers = function_exists('getallheaders') ? getallheaders() : [];
$clientToken = '';
foreach ($headers as $key => $val) {
    if (strtolower($key) === 'x-proxy-token') {
        $clientToken = $val;
        break;
    }
}
if (!$clientToken && isset($_SERVER['HTTP_X_PROXY_TOKEN'])) {
    $clientToken = $_SERVER['HTTP_X_PROXY_TOKEN'];
}

if ($clientToken !== 'my-secret-123') {
    http_response_code(403);
    echo json_encode([
        "result" => 403,
        "message" => "Unauthorized: Invalid or missing X-Proxy-Token header."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. Determine Action
$action = isset($_GET['action']) ? trim($_GET['action']) : '';
if ($action !== 'request' && $action !== 'verify') {
    http_response_code(400);
    echo json_encode([
        "result" => 400,
        "message" => "Invalid action parameter. Supported actions: request, verify"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Read Body Payload
$inputJSON = file_get_contents('php://input');
if (!$inputJSON) {
    http_response_code(400);
    echo json_encode([
        "result" => 400,
        "message" => "Empty request body payload."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 4. Forward to Official Zibal API
$targetUrl = "https://gateway.zibal.ir/v1/" . $action;

$ch = curl_init($targetUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, $inputJSON);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($inputJSON)
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode([
        "result" => 502,
        "message" => "Proxy cURL execution failed: " . $curlError
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code($httpCode ? $httpCode : 200);
echo $response;
