# Anleitung: Datenbank-Synchronisation (Team TechShop)

Da die Datenbank physisch auf dem jeweiligen lokalen XAMPP-Server liegt, muss sie bei Änderungen manuell über GitHub abgeglichen werden.

## Für Peter (Export):
1. Öffne phpMyAdmin (http://localhost/phpmyadmin).
2. Wähle die Datenbank `techshop_db` aus.
3. Klicke oben auf den Reiter **Exportieren**.
4. Methode: "Schnell", Format: "SQL". Klicke auf **Exportieren**.
5. Speichere die Datei in eurem Repository unter `backend/config/techshop_db.sql`.
6. Pushe die Datei auf GitHub und informiere das Team.

## Für Markus und Mishref (Import):
1. Führe einen `git pull` aus, um die neueste `.sql`-Datei zu erhalten.
2. Öffne phpMyAdmin.
3. Falls noch nicht vorhanden: Erstelle eine leere Datenbank `techshop_db`.
4. Wähle die Datenbank `techshop_db` aus.
5. Klicke oben auf den Reiter **Importieren**.
6. Wähle die Datei `backend/config/techshop_db.sql` aus deinem lokalen Projektordner.
7. Klicke unten auf **Importieren**.

WICHTIG: Wiederholt diesen Vorgang jedes Mal, wenn neue Tabellen (z. B. für Produkte oder Bestellungen) hinzugefügt wurden!