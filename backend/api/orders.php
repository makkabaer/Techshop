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
 *   delivery_address TEXT NOT NULL,
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
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Authentifizierung: User muss eingeloggt sein
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Bitte einloggen.']);
        exit;
    }
    
    $user_id = $_SESSION['user_id'];
    $db = Database::getInstance();

    // ==========================================
    // 1. NEU: CHECKOUT (POST)
    // ==========================================
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $delivery_address = trim($input['delivery_address'] ?? '');

        if (empty($delivery_address)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Lieferadresse fehlt.']);
            exit;
        }

        if (empty($_SESSION['cart'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Warenkorb ist leer.']);
            exit;
        }

        // 1. Preise berechnen 
        $totalPrice = 0;
        $orderItems = [];
        
        foreach ($_SESSION['cart'] as $product_id => $quantity) {
            $product = $db->query("SELECT price FROM products WHERE id = ?", [$product_id]);
            if (!empty($product)) {
                $price = $product[0]['price'];
                $totalPrice += ($price * $quantity);
                $orderItems[] = [
                    'product_id' => $product_id,
                    'quantity' => $quantity,
                    'price' => $price
                ];
            }
        }

        // 2. Transaktion starten 
        $pdo = $db->getConnection();
        $pdo->beginTransaction();

        try {
            // A) Rechnungsnummer generieren (falls noch nicht vorhanden)
            $invoiceNumber = generateInvoiceNumber($db);

            // B) Bestellung in 'orders' anlegen
            $orderData = [
                'user_id' => $user_id,
                'total_price' => $totalPrice,
                'delivery_address' => $delivery_address,
                'status' => 'paid' // Wir tun so, als wäre es bezahlt
            ];

            // Falls 'invoice_number' Spalte existiert, hinzufügen
            $columns = $db->query("SHOW COLUMNS FROM orders LIKE 'invoice_number'");
            if (!empty($columns)) {
                $orderData['invoice_number'] = $invoiceNumber;
            }

            $db->insert('orders', $orderData);
            
            $order_id = $pdo->lastInsertId();

            // C) Einzelne Produkte in 'order_items' speichern
            foreach ($orderItems as $item) {
                $db->insert('order_items', [
                    'order_id' => $order_id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price']
                ]);
            }

            // Transaktion bestätigen
            $pdo->commit();

            // Warenkorb leeren nach erfolgreichem Kauf!
            $_SESSION['cart'] = [];

            http_response_code(201);
            echo json_encode([
                'success' => true, 
                'message' => 'Bestellung erfolgreich abgeschlossen!',
                'order_id' => $order_id,
                'invoice_number' => $invoiceNumber
            ]);
            exit;

        } catch (Exception $e) {
            // Bei Fehler: Alles rückgängig machen!
            $pdo->rollBack();
            throw $e;
        }
    }

    // ==========================================
    // 2. BESTELLHISTORIE (GET)
    // ==========================================
    if ($method === 'GET') {
        
        // Prüfen, ob orders Tabelle existiert
        $tables = $db->query("SHOW TABLES LIKE 'orders'");
        if (empty($tables)) {
            http_response_code(503);
            echo json_encode(['success' => false, 'error' => 'Orders-System noch nicht konfiguriert.']);
            exit;
        }
        
        // Bestellungen für User abrufen
        $orders = $db->query(
            "SELECT id, order_date, total_price, status, 
                    COALESCE(invoice_number, '') as invoice_number 
             FROM orders 
             WHERE user_id = ? 
             ORDER BY order_date DESC",
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
            ]
        ]);
        exit;
    }

    // Ungültige Methode
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Methode nicht erlaubt.']);
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

/**
 * Generiert eine eindeutige Rechnungsnummer
 * Format: INV-YYYYMMDD-XXXXXX (z.B. INV-20260602-000001)
 * 
 * @param Database $db Datenbankinstanz
 * @return string Generierte Rechnungsnummer
 */
function generateInvoiceNumber($db) {
    $today = date('Ymd');
    $prefix = 'INV-' . $today . '-';
    
    // Letzte Rechnungsnummer des heutigen Tages suchen
    $result = $db->query(
        "SELECT invoice_number FROM orders 
         WHERE invoice_number LIKE ? 
         ORDER BY invoice_number DESC 
         LIMIT 1",
        [$prefix . '%']
    );
    
    if (!empty($result)) {
        // Extrahiere die Nummer aus der letzten Rechnungsnummer
        $lastInvoice = $result[0]['invoice_number'];
        $lastNumber = (int)substr($lastInvoice, -6); // Letzte 6 Ziffern
        $nextNumber = $lastNumber + 1;
    } else {
        // Erste Rechnungsnummer des Tages
        $nextNumber = 1;
    }
    
    return $prefix . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
}
?>
