<?php
session_start();
header('Content-Type: application/json');
require_once '../classes/Database.php';

// Nur Admins!
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

$productId = intval($_POST['product_id'] ?? 0);

if ($productId <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid product ID.']);
    exit;
}

$db = Database::getInstance();

// 1. Zuerst den Bildpfad holen, damit wir die Datei löschen können
$products = $db->query("SELECT image_path FROM products WHERE id = ?", [$productId]);

if (!empty($products)) {
    $imagePath = $products[0]['image_path'];
    
    // Datei vom Server löschen, falls sie existiert (unlink)
    if (!empty($imagePath)) {
        // Da in der DB "backend/productpictures/..." steht, müssen wir von /api/ aus zwei Ebenen hoch
        $absolutePath = __DIR__ . '/../../' . $imagePath;
        if (file_exists($absolutePath)) {
            unlink($absolutePath);
        }
    }
    
    // 2. Produkt aus der Datenbank löschen
    $db->delete('products', ['id' => $productId]);
    echo json_encode(['success' => true, 'message' => 'Product successfully deleted.']);
} else {
    echo json_encode(['success' => false, 'error' => 'Product not found.']);
}