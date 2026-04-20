# TechShop – Meilensteine & Iterationsplan

---

## Meilenstein 1: "Fundament steht" (nach Sprint 1)
**Zeitraum:** Week 1 (ca. 4-5 Tage)

### Ziel
Backend und Frontend können per JSON/AJAX miteinander sprechen. Benutzer können sich registrieren, einloggen und haben Zugriff auf ein Dashboard.

### Acceptance Criteria
- ✓ Datenbank läuft mit `users`-Tabelle
- ✓ DB-Service-Klasse ist einsatzbereit
- ✓ `/api/register.php` und `/api/login.php` geben valides JSON zurück
- ✓ Frontend zeigt Login-/Register-Formulare
- ✓ Nach erfolgreichem Login wird Dashboard geladen (Session aktiv)
- ✓ Logout funktioniert
- ✓ Keine "Dead-Ends" (Navigation ist überall möglich)

### Deliverables
- `backend/classes/Database.php` (DB-Service)
- `backend/classes/User.php` (User-Logik)
- `backend/api/register.php` (Endpunkt)
- `backend/api/login.php` (Endpunkt)
- `backend/api/logout.php` (Endpunkt)
- `backend/config/config.php` (Konfiguration)
- `index.html` (erweitert: Dashboard-Section)
- `js/app.js` (erweitert: Logout-Handler)
- `SPRINT_1.md` (Dokumentation)

---

## Meilenstein 2: "Der Katalog lebt" (nach Sprint 2)
**Zeitraum:** Week 2-3 (ca. 5-6 Tage)

### Ziel
Admins können Produkte anlegen (mit Bildern). Alle User sehen einen funktionierenden Produktkatalog mit Detailseite.

### Acceptance Criteria
- ✓ Admin kann sich mit speziellen Rechten einloggen
- ✓ Produkt-Tabelle existiert in DB
- ✓ File-Upload für Produktbilder funktioniert sicher (Validierung, Speicherung)
- ✓ `/api/products.php` listet alle Produkte auf (JSON)
- ✓ `/api/products.php` (POST) erlaubt Admin, neue Produkte anzulegen
- ✓ `/api/products/{id}.php` (PUT, DELETE) für Bearbeitung/Löschen
- ✓ Frontend: Produktliste mit Cards/Kacheln
- ✓ Frontend: Produktdetails (Modal oder separate Seite)
- ✓ Frontend: Admin-Panel zum Produkte verwalten (sichtbar nur für Admins)
- ✓ Testprodukte sind eingepflegt

### Deliverables
- `backend/classes/Product.php` (Product-Logik)
- `backend/api/products.php` (Endpunkte: GET, POST, PUT, DELETE)
- `backend/uploads/products/` (Verzeichnis für Bilder)
- `index.html` (erweitert: Produktliste, Admin-Panel)
- `js/app.js` (erweitert: Produkt-AJAX, Admin-Funktionen)
- `SPRINT_2.md` (Dokumentation)
- Sample-Daten: 5-10 Test-Produkte in DB

---

## Meilenstein 3: "Der Rubel rollt" (nach Sprint 3)
**Zeitraum:** Week 4-5 (ca. 5-6 Tage)

### Ziel
User können Produkte in den Warenkorb legen, den Checkout durchlaufen und erhalten Bestellbestätigung + Rechnung.

### Acceptance Criteria
- ✓ Warenkorb ist in Session gespeichert
- ✓ `/api/cart/add.php`, `/api/cart/remove.php`, `/api/cart.php` funktionieren
- ✓ Warenkorb-Icon in Navigation zeigt Artikelanzahl
- ✓ Warenkorb-Seite: Artikel, Mengen, Gesamtpreis
- ✓ Checkout-Prozess: Lieferadresse eingeben, bestätigen, kaufen
- ✓ `/api/orders.php` (POST) speichert Bestellung in DB
- ✓ Bestellbestätigung wird angezeigt (JSON → HTML)
- ✓ Rechnung wird generiert (HTML oder simple PDF)
- ✓ User sieht Bestellhistorie im Profil (`/api/orders.php` GET)
- ✓ Kompletter Kauffluss ist fehlerfrei (keine Dead-Ends)

### Deliverables
- `backend/classes/Order.php`, `backend/classes/OrderItem.php` (Order-Logik)
- `backend/classes/Invoice.php` (Rechnungs-Generierung)
- `backend/api/cart/add.php`, `backend/api/cart/remove.php`, etc.
- `backend/api/orders.php` (Endpunkte: GET, POST)
- `index.html` (erweitert: Warenkorb-Seite, Checkout-Formular)
- `js/app.js` (erweitert: Cart-Handling, Checkout-Flow)
- `SPRINT_3.md` (Dokumentation)
- DB-Tabellen: `orders`, `order_items`, `invoices`

---

## Meilenstein 4: "Feinschliff & Bonus" (nach Sprint 4)
**Zeitraum:** Week 6 (ca. 3-4 Tage + Review)

### Ziel
Gutscheine funktionieren, Design ist poliert, optionale Features sind implementiert, alles ist produktionsreif.

### Acceptance Criteria (Muss-Haben)
- ✓ Gutschein-System: Code validieren, Rabatt abziehen
- ✓ `/api/coupons/{code}.php` prüft Gutschein
- ✓ Frontend: Gutschein-Code-Feld im Warenkorb
- ✓ Rabatt wird in Gesamtpreis berücksichtigt
- ✓ Design: Keine Bruchkanten, responsive (Mobile/Desktop/Tablet)
- ✓ Alle Error-Messages sind sichtbar und hilfreicher
- ✓ Navigation: Keine Dead-Ends, klarer Prozessablauf
- ✓ API-Dokumentation & README sind fertig

### Acceptance Criteria (Bonus – ≥2 auswählen)
- ✓ Kategorie-Filter oder Suchfunktion
- ✓ Lagerverwaltung (Out-of-Stock Handling)
- ✓ Bewertungen/Reviews
- ✓ Favoriten speichern
- ✓ Admin-Dashboard (Statistiken)
- ✓ CSRF-Protection, XSS-Validierung
- ✓ Versandkosten-Berechnung

### Deliverables
- `backend/classes/Coupon.php` (Gutschein-Logik)
- `backend/api/coupons.php` (Endpunkte)
- `index.html` (Final Design)
- `css/style.css` (Polished)
- `js/app.js` (Final)
- `README.md` (Komplett: Setup, Anleitung, Projektinfo)
- `API_DOCUMENTATION.md` (Alle Endpunkte dokumentiert)
- `SPRINT_4.md` (Dokumentation)
- Bonus-Feature-Code (je nach Wahl)
- DB-Tabelle: `coupons`

---

## Projekt-Zeitplan

```
Week 1:  Sprint 1 ────────────────────────────────────→ Meilenstein 1 ✓
         (User-Auth, Fundament)

Week 2-3: Sprint 2 ────────────────────────────────────→ Meilenstein 2 ✓
          (Produktverwaltung, Admin-Panel)

Week 4-5: Sprint 3 ────────────────────────────────────→ Meilenstein 3 ✓
          (Warenkorb, Checkout, Bestellungen)

Week 6:  Sprint 4 ────────────────────────────────────→ Meilenstein 4 ✓
         (Gutscheine, Bonus, Polish)
         
         + Finale Review & Deployment
```

---

## Review-Punkte for Meilesteine

### Nach jedem Meilenstein:
1. **Feature-Überprüfung:** Alle AC erfüllt?
2. **Code-Review:** Code-Qualität, Security, Performance
3. **User-Acceptance:** Tester(in) durchläuft komplette Flow
4. **Doku-Check:** Ist alles dokumentiert?
5. **Planning:** Was für nächsten Sprint?

---

## Definition of Done (Meilenstein-Level)
- ✓ Alle AC sind erfüllt (grün markiert)
- ✓ Unit-/Integrations-Tests durchgeführt
- ✓ Code ist gereviewed und gemergt (Main-Branch)
- ✓ Doku ist aktualisiert
- ✓ Demo wird durchgeführt (auch mit Stakeholder, falls vorhanden)
- ✓ Retrospektive: Was lief gut? Was besser?

