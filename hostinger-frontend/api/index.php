<?php
// Production-grade Auto-Starting Reverse Proxy Bridge for Hostinger
// Supports Large JSON payloads, Videos, Form-Data, Multipart Uploads, and Persistent Node.js Backend

@ini_set('memory_limit', '512M');
@ini_set('max_execution_time', '300');
@ini_set('post_max_size', '150M');
@ini_set('upload_max_filesize', '150M');

$backend_host = 'http://127.0.0.1:8080';
$node_bin     = '/opt/alt/alt-nodejs20/root/usr/bin/node';
$backend_dir  = '/home/u933632718/domains/zafexcollectibles.com/backend';
$script_path  = $backend_dir . '/index.mjs';
$log_path     = $backend_dir . '/server.log';

function is_backend_alive() {
    $fp = @fsockopen('127.0.0.1', 8080, $errno, $errstr, 0.4);
    if ($fp) { fclose($fp); return true; }
    return false;
}

// 1. Auto-Start Node.js Backend if it stopped
if (!is_backend_alive()) {
    if (file_exists($node_bin) && file_exists($script_path)) {
        $cmd = "cd " . escapeshellarg($backend_dir) . " && nohup " . escapeshellarg($node_bin) . " index.mjs > " . escapeshellarg($log_path) . " 2>&1 &";
        @shell_exec($cmd);
        for ($i = 0; $i < 5; $i++) {
            usleep(500000);
            if (is_backend_alive()) break;
        }
    }
}

// 2. Prepare Request Forwarding
$request_uri  = $_SERVER['REQUEST_URI'];
$target_url   = $backend_host . $request_uri;
$method       = $_SERVER['REQUEST_METHOD'];

$headers = function_exists('getallheaders') ? getallheaders() : [];
if (!is_array($headers) || empty($headers)) {
    $headers = [];
    foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) == 'HTTP_') {
            $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
        }
    }
}
if (isset($_SERVER['CONTENT_TYPE']) && !isset($headers['Content-Type']) && !isset($headers['content-type'])) {
    $headers['Content-Type'] = $_SERVER['CONTENT_TYPE'];
}

$forward_headers = [];
foreach ($headers as $key => $value) {
    $lower = strtolower($key);
    if (!in_array($lower, ['host', 'connection', 'keep-alive', 'transfer-encoding', 'content-length', 'expect'])) {
        $forward_headers[] = "$key: $value";
    }
}

// Disable Expect: 100-continue which causes cURL to stall on large payloads > 1MB
$forward_headers[] = "Expect:";

$client_ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$forward_headers[] = "X-Forwarded-For: $client_ip";
$forward_headers[] = "X-Forwarded-Proto: " . (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http');

if (isset($_SERVER['HTTP_COOKIE'])) {
    $forward_headers[] = "Cookie: " . $_SERVER['HTTP_COOKIE'];
}

$ch = curl_init($target_url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_TCP_NODELAY, 1);

// Handle Multipart File Uploads vs Raw Body
if (!empty($_FILES) || (!empty($_POST) && isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false)) {
    $post_data = $_POST;
    foreach ($_FILES as $field_name => $file_info) {
        if (is_array($file_info['tmp_name'])) {
            foreach ($file_info['tmp_name'] as $idx => $tmp_name) {
                if (!empty($tmp_name) && is_uploaded_file($tmp_name)) {
                    $post_data["{$field_name}[{$idx}]"] = new CURLFile($tmp_name, $file_info['type'][$idx] ?: 'application/octet-stream', $file_info['name'][$idx]);
                }
            }
        } else if (!empty($file_info['tmp_name']) && is_uploaded_file($file_info['tmp_name'])) {
            $post_data[$field_name] = new CURLFile($file_info['tmp_name'], $file_info['type'] ?: 'application/octet-stream', $file_info['name']);
        }
    }
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    // Remove incoming content-type header so cURL sets the valid boundary
    $forward_headers = array_values(array_filter($forward_headers, function($h) {
        return stripos($h, 'content-type:') !== 0;
    }));
} else {
    $body = file_get_contents('php://input');
    if (!empty($body) || in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $forward_headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 300);

$response = curl_exec($ch);

if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Backend Gateway Error', 'message' => 'Node backend starting, please retry in 2 seconds.']);
    curl_close($ch);
    exit;
}

$http_code   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$header_text = substr($response, 0, $header_size);
$body_text   = substr($response, $header_size);

http_response_code($http_code ?: 200);

foreach (explode("\r\n", $header_text) as $hdr) {
    if (empty($hdr)) continue;
    $lower = strtolower($hdr);
    if (strpos($lower, 'transfer-encoding:') === 0 || strpos($lower, 'content-length:') === 0) continue;
    if (strpos($lower, 'set-cookie:') === 0) {
        header($hdr, false);
    } else {
        header($hdr, true);
    }
}

echo $body_text;
curl_close($ch);
