<?php
/**
 * POST /api/edit_product.php
 * Aktualisiert ein bestehendes Produkt (nur für Admins)
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
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $rating = floatval($_POST['rating'] ?? 0);

    if ($productId <= 0 || empty($name) || empty($price)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Product ID, name and price are required.']);
        exit;
    }

    // Aktuelles Produkt holen, um den alten Bildpfad zu kennen
    $currentProduct = Product::getById($productId);
    if (!$currentProduct) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Product not found.']);
        exit;
    }

    $currentImagePath = $currentProduct['image_path'];

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
                $currentImagePath = 'backend/productpictures/' . $newFileName;
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

    // Produkt mit OOP-Klasse aktualisieren
    $product = new Product();
    if ($product->update($productId, [
        'name' => $name,
        'description' => $description,
        'price' => $price,
        'rating' => $rating,
        'image_path' => $currentImagePath
    ])) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Product successfully updated!']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update product.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}