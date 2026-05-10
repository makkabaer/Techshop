<?php
session_start();
header('Content-Type: application/json');
require_once '../classes/Database.php';

// Nur Admins!
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized.']);
    exit;
}

$productId = intval($_POST['product_id'] ?? 0);
$name = trim($_POST['name'] ?? '');
$description = trim($_POST['description'] ?? '');
$price = floatval($_POST['price'] ?? 0);

if ($productId <= 0 || empty($name) || empty($price)) {
    echo json_encode(['success' => false, 'error' => 'Product ID, name and price are required.']);
    exit;
}

$db = Database::getInstance();
$products = $db->query("SELECT image_path FROM products WHERE id = ?", [$productId]);

if (empty($products)) {
    echo json_encode(['success' => false, 'error' => 'Product not found.']);
    exit;
}

// Wir merken uns den alten Pfad. Falls kein neues Bild kommt, bleibt dieser einfach bestehen.
$currentImagePath = $products[0]['image_path'];

// Wenn ein NEUES Bild hochgeladen wurde
if (isset($_FILES['product_image']) && $_FILES['product_image']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['product_image']['tmp_name'];
    $fileName = $_FILES['product_image']['name'];
    
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg', 'webp');
    
    if (in_array($fileExtension, $allowedfileExtensions)) {
        // Altes Bild vom Server löschen!
        if (!empty($currentImagePath)) {
            $absoluteOldPath = __DIR__ . '/../../' . $currentImagePath;
            if (file_exists($absoluteOldPath)) {
                unlink($absoluteOldPath);
            }
        }

        // Neues Bild speichern
        $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
        $dest_path = '../productpictures/' . $newFileName;
        
        if (move_uploaded_file($fileTmpPath, $dest_path)) {
            $currentImagePath = 'backend/productpictures/' . $newFileName; // Überschreibt den Pfad für die DB
        }
    }
}

// Datenbank-Update durchführen
$db->update('products', [
    'name' => $name,
    'description' => $description,
    'price' => $price,
    'image_path' => $currentImagePath
], ['id' => $productId]);

echo json_encode(['success' => true, 'message' => 'Product successfully updated!']);