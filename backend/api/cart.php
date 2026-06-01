<?php
/**
 * Cart API Endpunkt
 * 
 * GET  /api/cart.php              -> Aktuellen Warenkorb zurückgeben
 * POST /api/cart.php              -> Item hinzufügen oder Menge ändern
 *                                    {product_id: int, quantity: int}
 * DELETE /api/cart.php?product_id=5  -> Item aus Warenkorb entfernen
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once '../classes/Database.php';
require_once '../classes/Product.php';

// Hilfsfunktion: Cart aus Session laden
function getCart() {
    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }
    return $_SESSION['cart'];
}

// Hilfsfunktion: Cart berechnen (mit Produktdetails)
function calculateCart($cart) {
    $db = Database::getInstance();
    $cartDetails = [];
    $totalPrice = 0;
    $totalItems = 0;

    foreach ($cart as $product_id => $quantity) {
        // Produktdetails aus Datenbank laden
        $results = $db->query("SELECT id, name, price FROM products WHERE id = ?", [$product_id]);
        
        if (!empty($results)) {
            $product = $results[0];
            $itemPrice = $product['price'] * $quantity;
            
            $cartDetails[] = [
                'product_id' => (int)$product_id,
                'name' => $product['name'],
                'price' => (float)$product['price'],
                'quantity' => (int)$quantity,
                'item_total' => (float)$itemPrice
            ];
            
            $totalPrice += $itemPrice;
            $totalItems += $quantity;
        }
    }

    return [
        'items' => $cartDetails,
        'total_items' => $totalItems,
        'total_price' => round($totalPrice, 2)
    ];
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    // ========== GET: Warenkorb anzeigen ==========
    if ($method === 'GET') {
        $cart = getCart();
        $cartData = calculateCart($cart);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $cartData
        ]);
        exit;
    }
    
    // ========== POST: Item hinzufügen oder Menge ändern ==========
    if ($method === 'POST') {
        // Request-Body dekodieren
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($input === null) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Ungültige JSON-Eingabe.'
            ]);
            exit;
        }
        
        $product_id = isset($input['product_id']) ? (int)$input['product_id'] : null;
        $quantity = isset($input['quantity']) ? (int)$input['quantity'] : null;
        
        // Validierung
        if ($product_id === null || $product_id <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Ungültige product_id.'
            ]);
            exit;
        }
        
        if ($quantity === null || $quantity <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Quantity muss >= 1 sein.'
            ]);
            exit;
        }
        
        // Prüfen, ob Produkt existiert
        $db = Database::getInstance();
        $products = $db->query("SELECT id FROM products WHERE id = ?", [$product_id]);
        
        if (empty($products)) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Produkt nicht gefunden.'
            ]);
            exit;
        }
        
        // Item zum Cart hinzufügen oder Menge aktualisieren
        if (!isset($_SESSION['cart'])) {
            $_SESSION['cart'] = [];
        }
        
        $_SESSION['cart'][$product_id] = $quantity;
        
        $cartData = calculateCart($_SESSION['cart']);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Item hinzugefügt.',
            'data' => $cartData
        ]);
        exit;
    }
    
    // ========== DELETE: Item aus Warenkorb entfernen ==========
    if ($method === 'DELETE') {
        $product_id = isset($_GET['product_id']) ? (int)$_GET['product_id'] : null;
        
        if ($product_id === null || $product_id <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Ungültige product_id.'
            ]);
            exit;
        }
        
        if (!isset($_SESSION['cart']) || !isset($_SESSION['cart'][$product_id])) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Item nicht im Warenkorb.'
            ]);
            exit;
        }
        
        // Item entfernen
        unset($_SESSION['cart'][$product_id]);
        
        $cartData = calculateCart($_SESSION['cart']);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Item entfernt.',
            'data' => $cartData
        ]);
        exit;
    }
    
    // Ungültige HTTP-Methode
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'HTTP-Methode nicht unterstützt. Erlaubt: GET, POST, DELETE'
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Fehler: ' . $e->getMessage()
    ]);
    exit;
}
?>
