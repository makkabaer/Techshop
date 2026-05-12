<?php
/**
 * POST /api/delete_product.php
 * Löscht ein Produkt (nur für Admins)
 */

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../classes/Product.php';

// Nur Admins!
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Admins only.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request method. POST required.']);
    exit;
}

try {
    $productId = intval($_POST['product_id'] ?? 0);

    if ($productId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Ungültige Produkt-ID.']);
        exit;
    }

    // Produkt mit OOP-Klasse löschen
    $product = new Product();
    if ($product->delete($productId)) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Produkt erfolgreich gelöscht.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Produkt nicht gefunden oder bereits gelöscht.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}