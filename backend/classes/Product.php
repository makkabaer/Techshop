<?php
// /backend/classes/Product.php

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/Database.php';

class Product {
    private $db;
    private $id;
    private $name;
    private $description;
    private $price;
    private $rating;
    private $image_path;
    private $created_at;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // Getter-Methoden
    public function getId() {
        return $this->id;
    }

    public function getName() {
        return $this->name;
    }

    public function getDescription() {
        return $this->description;
    }

    public function getPrice() {
        return $this->price;
    }

    public function getRating() {
        return $this->rating;
    }

    public function getImagePath() {
        return $this->image_path;
    }

    public function getCreatedAt() {
        return $this->created_at;
    }

    // Setter-Methoden
    public function setName($name) {
        $this->name = trim($name);
        return $this;
    }

    public function setDescription($description) {
        $this->description = trim($description);
        return $this;
    }

    public function setPrice($price) {
        $this->price = floatval($price);
        return $this;
    }

    public function setRating($rating) {
        $this->rating = floatval($rating);
        return $this;
    }

    public function setImagePath($image_path) {
        $this->image_path = $image_path;
        return $this;
    }

    /**
     * Alle aktiven Produkte auslesen
     * @return array Array von Produkten
     */
    public static function getAll() {
        $db = Database::getInstance();
        $sql = "SELECT p.id, p.name, p.description, p.price, p.rating, p.image_path, p.created_at, c.category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                ORDER BY p.created_at DESC";
        return $db->query($sql);
    }

    /**
     * Ein einzelnes Produkt nach ID auslesen
     * @param int $id Produkt-ID
     * @return array|null Produktdaten oder null
     */
    public static function getById($id) {
        $db = Database::getInstance();
        $sql = "SELECT p.id, p.name, p.description, p.price, p.rating, p.image_path, p.created_at, c.category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.id = ?";
        $results = $db->query($sql, [$id]);
        return !empty($results) ? $results[0] : null;
    }

    /**
     * Neues Produkt erstellen
     * @param array $data Produktdaten (name, description, price, rating, image_path, category_id)
     * @return int|false Neue Produkt-ID oder false
     */
    public function create($data) {
        // Validierung
        if (empty($data['name']) || empty($data['price'])) {
            throw new Exception('Product name and price are required.');
        }

        $insertData = [
            'name' => trim($data['name']),
            'description' => trim($data['description'] ?? ''),
            'price' => floatval($data['price']),
            'rating' => floatval($data['rating'] ?? 0),
            'image_path' => $data['image_path'] ?? null,
            // NEU: category_id sicher abspeichern (null, wenn leer)
            'category_id' => !empty($data['category_id']) ? intval($data['category_id']) : null
        ];

        return $this->db->insert('products', $insertData);
    }

    /**
     * Produkt aktualisieren
     * @param int $id Produkt-ID
     * @param array $data Zu aktualisierende Felder
     * @return bool Erfolg
     */
    public function update($id, $data) {
        if (empty($id)) {
            throw new Exception('Product ID is required.');
        }

        $updateData = [];
        
        if (isset($data['name'])) {
            $updateData['name'] = trim($data['name']);
        }
        if (isset($data['description'])) {
            $updateData['description'] = trim($data['description']);
        }
        if (isset($data['price'])) {
            $updateData['price'] = floatval($data['price']);
        }
        if (isset($data['rating'])) {
            $updateData['rating'] = floatval($data['rating']);
        }
        if (isset($data['image_path'])) {
            $updateData['image_path'] = $data['image_path'];
        }
        // NEU: category_id beim Update berücksichtigen
        if (isset($data['category_id'])) {
            $updateData['category_id'] = $data['category_id'] !== '' ? intval($data['category_id']) : null;
        }

        if (empty($updateData)) {
            throw new Exception('No data to update.');
        }

        $rowsAffected = $this->db->update('products', $updateData, ['id' => $id]);
        return $rowsAffected > 0;
    }

    /**
     * Produkt löschen
     * @param int $id Produkt-ID
     * @return bool Erfolg
     */
    public function delete($id) {
        if (empty($id)) {
            throw new Exception('Product ID is required.');
        }

        // Erst das Bild löschen, wenn vorhanden
        $product = self::getById($id);
        if ($product && !empty($product['image_path'])) {
            $imagePath = __DIR__ . '/../../' . $product['image_path'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        // Dann das Produkt aus der DB löschen
        $rowsAffected = $this->db->delete('products', ['id' => $id]);
        return $rowsAffected > 0;
    }

    /**
     * Produkt als Array zurückgeben (z.B. für JSON)
     * @return array
     */
    public function toArray() {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'rating' => $this->rating,
            'image_path' => $this->image_path,
            'created_at' => $this->created_at
        ];
    }

    /**
     * Produkte nach Textsuche durchsuchen
     * @param string $searchTerm Suchbegriff
     * @return array Array von gefundenen Produkten
     */
    public static function searchByText($searchTerm) {
        $db = Database::getInstance();
        $searchTerm = '%' . $searchTerm . '%';
        $sql = "SELECT p.id, p.name, p.description, p.price, p.rating, p.image_path, p.created_at, c.category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.name LIKE ? OR p.description LIKE ?
                ORDER BY p.created_at DESC";
        return $db->query($sql, [$searchTerm, $searchTerm]);
    }

    /**
     * Produkte nach Kategorie abrufen
     * @param string $category Kategorie
     * @return array Array von Produkten in dieser Kategorie
     */
    public static function getByCategory($category) {
        $db = Database::getInstance();
        $sql = "SELECT p.id, p.name, p.description, p.price, p.rating, p.image_path, p.created_at, c.category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE LOWER(COALESCE(c.category_name, '')) = LOWER(?)
                ORDER BY p.created_at DESC";
        return $db->query($sql, [$category]);
    }

    /**
     * Produkte nach Textsuche UND Kategorie durchsuchen
     * @param string $searchTerm Suchbegriff
     * @param string $category Kategorie
     * @return array Array von gefundenen Produkten
     */
    public static function searchByTextAndCategory($searchTerm, $category) {
        $db = Database::getInstance();
        $searchTerm = '%' . $searchTerm . '%';
        $sql = "SELECT p.id, p.name, p.description, p.price, p.rating, p.image_path, p.created_at, c.category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE (p.name LIKE ? OR p.description LIKE ?) 
                AND LOWER(COALESCE(c.category_name, '')) = LOWER(?)
                ORDER BY p.created_at DESC";
        return $db->query($sql, [$searchTerm, $searchTerm, $category]);
    }
}
