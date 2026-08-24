<?php
// Root API Proxy Bridge for Zafex Collectibles
$ch = curl_init('http://127.0.0.1:8080' . $_SERVER['REQUEST_URI']);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$headers = [];
$incoming = function_exists('getallheaders') ? getallheaders() : [];
foreach ($incoming as $k => $v) {
    if (!in_array(strtolower($k), ['host', 'connection', 'transfer-encoding'])) {
        $headers[] = "$k: $v";
    }
}
if (isset($_SERVER['CONTENT_TYPE']) && !isset($incoming['Content-Type'])) {
    $headers[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];
}
if (isset($_SERVER['HTTP_COOKIE'])) {
    $headers[] = 'Cookie: ' . $_SERVER['HTTP_COOKIE'];
}

$body = file_get_contents('php://input');
if (!empty($body) || in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$res = curl_exec($ch);

if ($res === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Node backend offline', 'msg' => curl_error($ch)]);
    curl_close($ch);
    exit;
}

$h_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
http_response_code($code);

foreach (explode("\r\n", substr($res, 0, $h_size)) as $hdr) {
    if ($hdr && stripos($hdr, 'transfer-encoding:') === false && stripos($hdr, 'content-length:') === false) {
        header($hdr, false);
    }
}
echo substr($res, $h_size);
curl_close($ch);
