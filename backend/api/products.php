<?php
/**
 * GET /api/products.php
 * 
 * Liefert:
 * - GET /api/products.php                      -> Alle Produkte
 * - GET /api/products.php?id=5                 -> Einzelnes Produkt mit ID 5
 * - GET /api/products.php?search=...           -> Produkte mit Textsuche
 * - GET /api/products.php?category=...         -> Produkte in einer Kategorie
 * - GET /api/products.php?search=...&category=...  -> Kombinierte Suche
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../classes/Product.php';

try {
    // Prüfen, ob eine ID als Query-Parameter vorhanden ist
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        // Einzelnes Produkt abrufen
        $id = intval($_GET['id']);
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid product ID.'
            ]);
            exit;
        }

        $product = Product::getById($id);

        if ($product === null) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Product not found.'
            ]);
            exit;
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $product
        ]);
    } else {
        // Alle Produkte abrufen oder gefiltert
        $products = [];
        $hasSearch = isset($_GET['search']) && !empty(trim($_GET['search']));
        $hasCategory = isset($_GET['category']) && !empty(trim($_GET['category']));

        if ($hasSearch && $hasCategory) {
            // Kombinierte Suche
            $searchTerm = trim($_GET['search']);
            $category = trim($_GET['category']);
            $products = Product::searchByTextAndCategory($searchTerm, $category);
        } elseif ($hasSearch) {
            // Nur Textsuche
            $searchTerm = trim($_GET['search']);
            $products = Product::searchByText($searchTerm);
        } elseif ($hasCategory) {
            // Nur Kategorie-Filter
            $category = trim($_GET['category']);
            $products = Product::getByCategory($category);
        } else {
            // Alle Produkte
            $products = Product::getAll();
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'count' => count($products),
            'data' => $products
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
    exit;
}
