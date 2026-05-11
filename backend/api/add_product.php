<?php
/**
 * POST /api/add_product.php
 * Erstellt ein neues Produkt (nur für Admins)
 */

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../classes/Product.php';

// Sicherheitscheck: Nur Admins dürfen Produkte anlegen!
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized access. Admins only.']);
    exit;
}

// Prüfen, ob es ein POST-Request ist
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request method. POST required.']);
    exit;
}

try {
    // Produktdaten auslesen
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $rating = floatval($_POST['rating'] ?? 0);

    if (empty($name) || empty($price)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Product name and price are required.']);
        exit;
    }

    $imagePath = null;

    // Bild-Upload-Logik
    if (isset($_FILES['product_image']) && $_FILES['product_image']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['product_image']['tmp_name'];
        $fileName = $_FILES['product_image']['name'];
        
        // Dateiendung prüfen (Sicherheit!)
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg', 'webp');
        
        if (in_array($fileExtension, $allowedfileExtensions)) {
            // Einzigartigen Dateinamen generieren
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
            $uploadFileDir = '../productpictures/';
            $dest_path = $uploadFileDir . $newFileName;
            
            if (move_uploaded_file($fileTmpPath, $dest_path)) {
                // Pfad für die Datenbank speichern (relativ zum Frontend)
                $imagePath = 'backend/productpictures/' . $newFileName;
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Error moving the uploaded file.']);
                exit;
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Upload failed. Allowed file types: ' . implode(',', $allowedfileExtensions)]);
            exit;
        }
    }

    // Produkt mit OOP-Klasse erstellen
    $product = new Product();
    $newProductId = $product->create([
        'name' => $name,
        'description' => $description,
        'price' => $price,
        'rating' => $rating,
        'image_path' => $imagePath
    ]);

    if ($newProductId) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Product successfully added!',
            'product_id' => $newProductId
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error while saving the product.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}