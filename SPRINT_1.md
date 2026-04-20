# Sprint 1: Fundament & User-Management
*Ziel: Backend und Frontend können per JSON/AJAX miteinander kommunizieren, User können sich registrieren und einloggen.*

---

## Meilenstein 1: "Fundament steht"
Nach Sprint 1 sollte folgende Infrastruktur laufen:
- ✅ Datenbank mit `users` Tabelle (bereits angelegt)
- ✅ DB-Service-Klasse (zentrale Zugriffe)
- ✅ User-Klasse (OOP)
- ✅ API-Endpunkte: `/api/register.php`, `/api/login.php`
- ✅ Frontend: Login/Register-Formulare mit AJAX
- ✅ Dashboard nach erfolgreichem Login (Session-Prüfung)

---

## Aufgaben nach Person

### **Person B (Backend Developer) – Peter**
**Endverantwortung: Login & Register API**

#### B1: User-Klasse erstellen
- Datei: `/backend/classes/User.php`
- Anforderungen:
  - Constructor mit `$username`, `$email`, `$password`
  - Methode `$user->register()` → Prüfung (Email schon vorhanden?), Hash-Passwort (password_hash), in DB speichern, JSON zurückgeben
  - Methode `$user->login()` → Email/Password prüfen, Session starten (`$_SESSION['user_id']`, `$_SESSION['username']`), JSON zurückgeben
  - Private Methode `validateEmail()` für Duplikat-Prüfung

#### B2: API-Endpunkte umsetzen
- **POST `/api/register.php`**
  - Input: `{username, email, password}` (POST-Parameter oder JSON)
  - Output: `{"success": true, "message": "User registered"}` oder `{"success": false, "error": "Email exists"}` (JSON)
  - Error-Handle: Fehlende Felder, Email existiert, DB-Error

- **POST `/api/login.php`** 
  - Input: `{email, password}`
  - Output: `{"success": true, "message": "Login successful", "username": "..."}` oder `{"success": false, "error": "Invalid credentials"}` (JSON)
  - Session-Start nach erfolgreichem Login
  - Error: Invalid credentials, Account nicht vorhanden

#### B3: Session-Handling
- Nach Login: Session starten mit User-ID und Username
- API soll prüfen, ob Session vorhanden → für spätere Dashboard-API reif machen

**Definition of Done (DoD) für B):** 
- Alle Endpunkte sind testbar (z.B. mit Postman)
- JSON-Response auf Erfolg und Fehlerfall vorhanden
- Passwörter werden gehasht (password_hash), nicht als Plaintext gespeichert
- DB-Verbindung über DB-Service-Klasse (von Person C)

---

### **Person C (Database & Fullstack) – Markus**
**Endverantwortung: Datenbankaufbau & zentrale DB-Klasse**

#### C1: Datenbank-Struktur finalisieren
- Datei: `/backend/db/schema.sql`
- Tabelle `users`:
  ```sql
  CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
  ```
- Hinweis: Weitere Tabellen (products, orders, etc.) kommen in Sprint 2+

#### C2: DB-Service-Klasse erstellen
- Datei: `/backend/classes/Database.php`
- Anforderungen (Singleton oder Static):
  - Private Constructor (oder static methods)
  - Methode `connect()` → PDO-Verbindung mit MySQLi (oder PDO mit MySQL)
  - Methode `query($sql, $params = [])` → Prepared Statement ausführen, Result als Array zurückgeben
  - Methode `insert($table, $data)` → INSERT ausführen, lastInsertId() zurückgeben
  - Methode `update($table, $data, $where)` → UPDATE ausführen
  - Methode `delete($table, $where)` → DELETE ausführen
  - Fehlerbehandlung: PDOException catchen, saubere Error-Messages
- **Keine Hardcoded Credentials!** Nutzen Sie `config.php` oder `.env`

#### C3: Konfiguration aufsetzen
- Datei: `/backend/config/config.php` oder `.env`
  ```php
  define('DB_HOST', 'localhost');
  define('DB_NAME', 'techshop_db');
  define('DB_USER', 'root');
  define('DB_PASS', '');
  ```

**Definition of Done (C):**
- DB läuft, `users` Tabelle existiert
- DB-Service-Klasse ist getestet und einsatzbereit
- Person B kann die DB-Klasse nutzen (keine Direktzugriffe auf MySQL)

---

### **Person A (Frontend Developer) – Mishref**
**Endverantwortung: User Interface & AJAX-Integration**

#### A1: Dashboard-Section hinzufügen
- Datei: `index.html`
- Nach erfolgreichem Login soll ein Dashboard angezeigt werden:
  - Willkommens-Nachricht: "Willkommen, {username}!"
  - Logout-Button
  - Placeholder für Produktliste/Warenkorb (für Sprint 2)
  - "Dead-End"-Check: User kann von überall zum Logout und zurück zum Login navigieren

#### A2: LOGIN-Flow vervollständigen
- Nach erfolgreicher Login-Response (JSON success=true):
  - Formulare clearen
  - Erfolgs-Message zeigen
  - Nach 1-2 Sekunden automatisch zum Dashboard wechseln
  - Username im Header anzeigen (Navigation aktualisieren)

#### A3: AJAX Error-Handling
- Existing Code erweitern:
  - Netzwerkfehler abfangen (xhr.status 500, timeout, etc.)
  - Validation-Fehler schön anzeigen (Bootstrap Alert)
  - Noch kein erfolgreicher Response → Fehler anzeigen, nicht absenden

#### A4: Logout-Button einbauen
- Einfacher Link/Button im Dashboard
- JavaScript: AJAX-Call zu `/api/logout.php` (wird von B gebaut)
- Nach Logout: Zurück zum Home-Screen, Navigation reset

**JavaScript zu ergänzen in `app.js`:**
```javascript
// Logout-Handler
$(".logout-btn").on("click", function (event) {
  event.preventDefault();
  $.ajax({
    url: "/api/logout.php",
    method: "POST",
    dataType: "json",
    success: function (response) {
      showMessage("success", "Logged out");
      showSection("#homeSection");
      $(".nav-link").removeClass("active");
      $("[data-section='home']").addClass("active");
    }
  });
});
```

**Definition of Done (A):**
- Dashboard-Sektion im HTML aufgebaut
- Login erfolgt, Dashboard wird angezeigt
- Logout funktioniert
- Keine "Dead-Ends" (Navigation funzt überall)
- Error-Messages sind lesbar

---

## Task-Verteilung (Priorität)

| # | Task | Person | Status | Geschätzt |
|---|------|--------|--------|-----------|
| 1 | DB-Schema + DB-Service-Klasse | C | To Do | 2d |
| 2 | User-Klasse (OOP) | B | To Do | 1d |
| 3 | Register-API | B | To Do | 1d |
| 4 | Login-API + Logout-API | B | To Do | 1.5d |
| 5 | Frontend: Dashboard-HTML | A | To Do | 0.5d |
| 6 | Frontend: Login/Register AJAX (existiert schon, nur Test) | A | To Do | 0.5d |
| 7 | Frontend: Logout & Session-Check | A | To Do | 0.5d |
| 8 | Integration testen (Alle) | All | To Do | 1d |

---

## Abhängigkeiten
```
C1 (DB-Schema) → C2 (DB-Service) → B1 (User-Klasse) → B2 (Register/Login API)
                                  → B3 (Session-Handling)
                                  
B2 + B3 + A1 + A2 → Integration Testing
```

**Startreihenfolge empfohlen:**
1. **Tag 1-2:** C macht Datenbank-Setup (C1, C2, C3)
2. **Tag 2-3:** B baut User-Klasse und APIs (parallel zu C)
3. **Day 3:** A erweitert Frontend (wenn C & B APIs liefern)
4. **Day 4:** Alle zusammen Integrations-Test

---

## Definition of Done (Sprint 1)
- [ ] Alle API-Endpunkte (Register, Login, Logout) return JSON
- [ ] Frontend zeigt Erfolgs-/Fehler-Messages
- [ ] Nach Login wird Dashboard angezeigt (Session aktiv)
- [ ] Logout funktioniert und löscht Session
- [ ] Keine SQL-Injection möglich (Prepared Statements)
- [ ] Keine Plain-Text Passwörter in DB
- [ ] Code ist kommentiert (Englisch oder Deutsch)
- [ ] Testbar mit Postman (Backend) & Browser (Frontend)

---

## Kommunikation während Sprint 1
- **Daily Standup (3x pro Woche):** 5-10 Min, Was fertig? Was blockiert?
- **Integration-Check (Mitte Sprint):** Sind APIs tatsächlich nutzbar vom Frontend?
- **Review (Tag 4-5):** Alles läuft? DoD erfüllt?

---

## Next Steps nach Sprint 1
→ **Sprint 2: Produktverwaltung starten** (Admin-Panel, Product-Klasse, File-Uploads)
