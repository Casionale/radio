<?php
header('Content-Type: application/json; charset=utf-8');

$AUTH_KEY = 'ВСТАВЬ_СЮДА_СВОЙ_AUTHORIZATION_KEY';

$input = json_decode(file_get_contents('php://input'), true);
$message = trim($input['message'] ?? '');

if ($message === '') {
    echo json_encode(['reply' => '']);
    exit;
}

$payload = [
    'model' => 'GigaChat',
    'messages' => [
        [
            'role' => 'system',
            'content' => 'Ты дружелюбный чат-бот сайта. Отвечай кратко и по делу.'
        ],
        [
            'role' => 'user',
            'content' => $message
        ]
    ],
    'temperature' => 0.7,
    'max_tokens' => 200
];

$ch = curl_init('https://gigachat.devices.sberbank.ru/api/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $AUTH_KEY,
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($payload)
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

echo json_encode([
    'reply' => $data['choices'][0]['message']['content']
        ?? 'Я пока не умею этого, но когда-нибудь смогу тебе ответить 🤖'
]);
