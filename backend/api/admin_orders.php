<?php
/**
 * Admin Orders API Endpunkt
 * * GET /api/admin_orders.php -> Alle Bestellungen aller User anzeigen
 * DELETE /api/admin_orders.php?order_id=1&product_id=5 -> Item löschen & Preis neu berechnen
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once '../classes/Database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    // 1. Authentifizierung & Autorisierung: MUSS ein Admin sein!
    // (Passe 'role' an, falls eure Session-Variable anders heißt, z.B. is_admin)
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Zugriff verweigert. Nur für Administratoren.']);
        exit;
    }
    
    $db = Database::getInstance();

    // ==========================================
    // GET: Alle Bestellungen anzeigen
    // ==========================================
    if ($method === 'GET') {
        // Wir verknüpfen (JOIN) die Orders mit der Users-Tabelle, damit der Admin sieht, wer bestellt hat!
        $sql = "SELECT o.id, o.order_date, o.total_price, o.status, o.delivery_address, u.username, u.email 
                FROM orders o 
                JOIN users u ON o.user_id = u.id 
                ORDER BY o.order_date DESC";
                
        $orders = $db->query($sql);
        
        $ordersWithItems = [];
        foreach ($orders as $order) {
            // Hole die Artikel für diese spezifische Bestellung
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
        echo json_encode(['success' => true, 'data' => ['orders' => $ordersWithItems]]);
        exit;
    }
    
    // ==========================================
    // DELETE: Ein Produkt aus der Bestellung löschen & Preis updaten
    // ==========================================
    if ($method === 'DELETE') {
        $order_id = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;
        $product_id = isset($_GET['product_id']) ? (int)$_GET['product_id'] : 0;
        
        if ($order_id <= 0 || $product_id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Ungültige order_id oder product_id.']);
            exit;
        }

        $pdo = $db->getConnection();
        $pdo->beginTransaction(); // Sichert die Datenbank (Alles oder Nichts)

        try {
            // 1. Das Item aus der Bestellung löschen
            $db->delete('order_items', [
                'order_id' => $order_id, 
                'product_id' => $product_id
            ]);

            // 2. Den neuen Gesamtpreis der Bestellung berechnen
            $result = $db->query(
                "SELECT COALESCE(SUM(price * quantity), 0) as new_total 
                 FROM order_items 
                 WHERE order_id = ?", 
                [$order_id]
            );
            $new_total = $result[0]['new_total'];

            // 3. Den neuen Preis in der orders Tabelle speichern
            $db->update('orders', 
                ['total_price' => $new_total], 
                ['id' => $order_id]
            );

            // Alles hat geklappt -> In die Datenbank schreiben!
            $pdo->commit();

            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'Produkt erfolgreich aus der Bestellung entfernt.',
                'new_total' => $new_total
            ]);
            exit;

        } catch (Exception $e) {
            $pdo->rollBack(); // Fehler aufgetreten -> Nichts abspeichern!
            throw $e;
        }
    }

    // Wenn es weder GET noch DELETE ist
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Methode nicht erlaubt.']);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server Fehler: ' . $e->getMessage()]);
    exit;
}