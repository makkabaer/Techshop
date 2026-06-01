<?php
/**
 * Orders API Endpunkt
 * 
 * GET /api/orders.php              -> Bestellhistorie für eingeloggten User
 * 
 * HINWEIS: Benötigt noch eine 'orders' Tabelle in der Datenbank:
 * CREATE TABLE orders (
 *   id INT PRIMARY KEY AUTO_INCREMENT,
 *   user_id INT NOT NULL,
 *   order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   total_price DECIMAL(10,2),
 *   status VARCHAR(50) DEFAULT 'pending',
 *   FOREIGN KEY (user_id) REFERENCES users(id)
 * );
 * 
 * CREATE TABLE order_items (
 *   id INT PRIMARY KEY AUTO_INCREMENT,
 *   order_id INT NOT NULL,
 *   product_id INT NOT NULL,
 *   quantity INT,
 *   price DECIMAL(10,2),
 *   FOREIGN KEY (order_id) REFERENCES orders(id),
 *   FOREIGN KEY (product_id) REFERENCES products(id)
 * );
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once '../classes/Database.php';

try {
    // Nur GET-Requests erlaubt
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'HTTP-Methode nicht unterstützt. Nur GET erlaubt.'
        ]);
        exit;
    }
    
    // Authentifizierung: User muss eingeloggt sein
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Authentifizierung erforderlich. Bitte einloggen.'
        ]);
        exit;
    }
    
    $user_id = $_SESSION['user_id'];
    $db = Database::getInstance();
    
    // Prüfen, ob orders Tabelle existiert
    $tables = $db->query("SHOW TABLES LIKE 'orders'");
    
    if (empty($tables)) {
        http_response_code(503);
        echo json_encode([
            'success' => false,
            'error' => 'Orders-System noch nicht konfiguriert. DB-Tabellen fehlen.',
            'hint' => 'Bitte die DB-Migration ausführen.'
        ]);
        exit;
    }
    
    // Bestellungen für User abrufen
    $orders = $db->query(
        "SELECT o.id, o.order_date, o.total_price, o.status 
         FROM orders o 
         WHERE o.user_id = ? 
         ORDER BY o.order_date DESC",
        [$user_id]
    );
    
    // Für jede Bestellung die Items abrufen
    $ordersWithItems = [];
    foreach ($orders as $order) {
        $items = $db->query(
            "SELECT oi.product_id, p.name, oi.quantity, oi.price 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?",
            [$order['id']]
        );
        
        $order['items'] = $items;
        $ordersWithItems[] = $order;
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'user_id' => (int)$user_id,
            'orders' => $ordersWithItems,
            'total_orders' => count($ordersWithItems)
        ]
    ]);
    exit;

} catch (Exception $e) {
    // Fehlerbehandlung: Wenn Tabelle nicht existiert, wird das abgefangen
    if (strpos($e->getMessage(), "Table") !== false) {
        http_response_code(503);
        echo json_encode([
            'success' => false,
            'error' => 'Orders-System noch nicht konfiguriert.',
            'hint' => 'Bitte DB-Migration ausführen.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Abrufen der Bestellungen: ' . $e->getMessage()
        ]);
    }
    exit;
}
?>
