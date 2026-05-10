<?php
session_start();
header('Content-Type: application/json');
require_once '../classes/Database.php';

// Sicherheitscheck: Nur Admins dürfen Produkte anlegen!
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access. Admins only.']);
    exit;
}

// Prüfen, ob es ein POST-Request ist
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

// Produktdaten auslesen
$name = trim($_POST['name'] ?? '');
$description = trim($_POST['description'] ?? '');
$price = floatval($_POST['price'] ?? 0);
$rating = floatval($_POST['rating'] ?? 0);

if (empty($name) || empty($price)) {
    echo json_encode(['success' => false, 'error' => 'Product name and price are required.']);
    exit;
}

$imagePath = null;

// Bild-Upload-Logik
if (isset($_FILES['product_image']) && $_FILES['product_image']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['product_image']['tmp_name'];
    $fileName = $_FILES['product_image']['name'];
    $fileSize = $_FILES['product_image']['size'];
    
    // Dateiendung prüfen (Sicherheit!)
    $fileNameCmps = explode(".", $fileName);
    $fileExtension = strtolower(end($fileNameCmps));
    $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg', 'webp');
    
    if (in_array($fileExtension, $allowedfileExtensions)) {
        // Einzigartigen Dateinamen generieren, um Überschreiben zu verhindern
        $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
        
        // Zielverzeichnis
        $uploadFileDir = '../productpictures/';
        $dest_path = $uploadFileDir . $newFileName;
        
        if (move_uploaded_file($fileTmpPath, $dest_path)) {
            // Pfad für die Datenbank speichern (relativ zum Frontend)
            $imagePath = 'backend/productpictures/' . $newFileName;
        } else {
            echo json_encode(['success' => false, 'error' => 'Error moving the uploaded file.']);
            exit;
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Upload failed. Allowed file types: ' . implode(',', $allowedfileExtensions)]);
        exit;
    }
}

// Produkt in die Datenbank eintragen
$db = Database::getInstance();
$newProductId = $db->insert('products', [
    'name' => $name,
    'description' => $description,
    'price' => $price,
    'rating' => $rating,
    'image_path' => $imagePath
]);

if ($newProductId) {
    echo json_encode(['success' => true, 'message' => 'Product successfully added!']);
} else {
    echo json_encode(['success' => false, 'error' => 'Database error while saving the product.']);
}