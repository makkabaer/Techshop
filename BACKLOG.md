# TechShop – Product Backlog
*Vollständige Liste aller Features und Aufgaben über alle 4 Sprints*

---

## Übersicht nach Epic

### Epic 1: Infrastruktur & Setup (Sprint 1 + durchgehend)
- [ ] Projektstruktur (Ordner) aufbauen
- [ ] Git-Repository initializieren (gitignore, etc.)
- [ ] Datenbank-Schema entwerfen (ER-Modell)
- [ ] Zentrale DB-Service-Klasse (PDO/MySQLi)
- [ ] Basis-Konfiguration (DB-Credentials, Konstanten)
- [ ] API-Response-Format standardisieren (JSON-Struktur)

### Epic 2: User-Management (Sprint 1)
- [ ] User-Klasse in PHP (OOP)
- [ ] Registrierung (API-Endpunkt)
- [ ] Login (API-Endpunkt)
- [ ] Logout (API-Endpunkt)
- [ ] Session/Cookie-Handling
- [ ] Passwort-Hashing (password_hash)
- [ ] Email-Duplikat-Prüfung
- [ ] Frontend: Login-Formular mit AJAX
- [ ] Frontend: Register-Formular mit AJAX
- [ ] Frontend: Dashboard (nach Login sichtbar)
- [ ] Frontend: Logout-Funktion

### Epic 3: Admin-Bereich & Rechtesystem (Sprint 2 Anfang)
- [ ] Admin-Flag in User-Tabelle
- [ ] Admin-Check-Klasse (IsAdmin-Funktion)
- [ ] Admin-Panel (Frontend Seite für Admins)
- [ ] Seeding: Test-Admin-User erstellen
- [ ] Zugriffskontrolle APIs (Nur Admin darf bestimmte Endpoints benutzen)

### Epic 4: Produkt-Management (Sprint 2)
- [ ] Product-Klasse in PHP
- [ ] Produkt-Tabelle in DB (id, name, description, price, category, image_path, created_at)
- [ ] API: GET `/api/products.php` (alle Produkte auflisten)
- [ ] API: POST `/api/products.php` (Admin: Produkt erstellen)
- [ ] API: PUT `/api/products/{id}.php` (Admin: Produkt bearbeiten)
- [ ] API: DELETE `/api/products/{id}.php` (Admin: Produkt löschen)
- [ ] File-Upload für Produktbilder (sichere Speicherung)
- [ ] Frontend: Produktliste anzeigen (mit Bootstrap-Cards)
- [ ] Frontend: Produktdetails (Modal oder separate Seite)
- [ ] Frontend: Admin-Interface zum Produkte anlegen/bearbeiten

### Epic 5: Warenkorb (Sprint 3 Anfang)
- [ ] Cart-Klasse (in PHP oder JavaScript?)
- [ ] Warenkorb in Session speichern (Struktur: `$_SESSION['cart'] = array()`)
- [ ] API: POST `/api/cart/add.php` (Produkt hinzufügen)
- [ ] API: POST `/api/cart/remove.php` (Produkt entfernen)
- [ ] API: GET `/api/cart.php` (Warenkorb anzeigen)
- [ ] API: POST `/api/cart/clear.php` (Warenkorb leeren)
- [ ] Warenkorb-Summe berechnen (mit Steuern/Versand?)
- [ ] Frontend: Warenkorb-Icon in Navigation (mit Anzahl)
- [ ] Frontend: Warenkorb-Seite (Mengen ändern, Artikel löschen, Gesamtpreis)
- [ ] Frontend: "In den Warenkorb"-Button auf Produkten

### Epic 6: Checkout & Bestellungen (Sprint 3)
- [ ] Order-Klasse (mit OrderItem als Details)
- [ ] Order-Tabellen (orders, order_items)
- [ ] API: POST `/api/orders.php` (Bestellung abschicken)
- [ ] API: GET `/api/orders.php` (Bestellverlauf des Users)
- [ ] API: GET `/api/orders/{id}.php` (Bestelldetails)
- [ ] Checkout-Prozess: Lieferadresse abfragen
- [ ] Checkout-Prozess: Artikel-Übersicht bestätigen
- [ ] Frontend: Checkout-Formular (Name, Adresse, etc.)
- [ ] Frontend: Bestellbestätigung nach erfolgreichem Checkout
- [ ] Frontend: Bestellhistorie im Kundenprofil

### Epic 7: Rechnungen (Sprint 3 Ende)
- [ ] Invoice-Klasse (generiert Rechnungs-PDF oder HTML)
- [ ] Tabelle: invoices (mit Status)
- [ ] API: GET `/api/invoices/{order_id}.php` (Rechnung abrufen)
- [ ] Rechnungs-HTML-Template (Header, Kundendaten, Positionen, Summe)
- [ ] Frontend: Rechnung anzeigen/drucken-Link im Bestell-Detail

### Epic 8: Gutscheine (Sprint 4)
- [ ] Gutschein-Klasse (Validierung, Anwendung)
- [ ] Tabelle: coupons (code, discount_percent/amount, expiry, is_used)
- [ ] API: GET `/api/coupons/{code}.php` (Gutschein validieren)
- [ ] API: POST `/api/coupons.php` (Admin: Gutschein erstellen)
- [ ] Rabatt-Berechnung (% oder fixer Betrag)
- [ ] Frontend: Gutschein-Code Input im Warenkorb
- [ ] Frontend: Rabatt in Summe anzeigen

### Epic 9: Bonus-Features / Grün markierte Abschnitte (Sprint 4)
**Beispiele (euer Team wählt 2-3):**
- [ ] **Kategorien/Filter:** Produkte nach Kategorie filtern
- [ ] **Suchfunktion:** Produkte nach Name/Beschreibung suchen (mit AJAX)
- [ ] **Lagerverwaltung:** Nur Produkte zeigen, die auf Lager sind
- [ ] **Bewertungen:** Kunden können Produkte bewerten (1-5 Sterne)
- [ ] **Favoriten:** User können Produkte als Favoriten speichern
- [ ] **Newsletter-Abo:** User-E-Mails speichern für Marketing
- [ ] **Versandkosten-Berechnung:** Abhängig von Gewicht/Zielland
- [ ] **PayPal/Stripe-Integration:** Testweise einbinden (Sandbox)
- [ ] **Bestell-Status-Tracking:** "Bestellung aufgegeben" → "Versandt" → "Zugestellt"
- [ ] **Admin-Dashboard:** Statistiken (Umsatz, Bestseller, etc.)

### Epic 10: Testing & Qualität (Alle Sprints)
- [ ] Manuelle Tests durchführen (Browser, verschiedene Geräte)
- [ ] SQL-Injection-Tests
- [ ] XSS-Tests (User-Input validieren)
- [ ] CSRF-Protection (Token für POST-Requests)
- [ ] Error-Handling (Keine DB-Errors zum User sichtbar)
- [ ] Performance: Große Produktlisten laden schnell

### Epic 11: Dokumentation & DevOps (Laufend)
- [ ] README.md fertigstellen (Setup-Anleitung)
- [ ] API-Dokumentation (Alle Endpunkte, Parameter, Response-Format)
- [ ] Code-Kommentare (englisch oder deutsch)
- [ ] Deployment-Guide (wie läuft das auf dem Produktions-Server?)
- [ ] Dateistruktur dokumentieren

---

## Stories & Tasks nach Sprint

### Sprint 1: Fundament & User-Management
**Story:** "Als User möchte ich mich registrieren und einloggen, damit ich einkaufen kann."

| ID | Task | Person | Status |
|----|------|--------|--------|
| S1-1 | DB-Schema + tables | C | To Do |
| S1-2 | DB-Service-Klasse (CRUD) | C | To Do |
| S1-3 | User-Klasse (OOP) | B | To Do |
| S1-4 | Register-API (/api/register.php) | B | To Do |
| S1-5 | Login-API + Session (/api/login.php) | B | To Do |
| S1-6 | Logout-API (/api/logout.php) | B | To Do |
| S1-7 | Frontend: Login-Formular (HTML) | A | In Progress |
| S1-8 | Frontend: Register-Formular (HTML) | A | In Progress |
| S1-9 | Frontend: Dashboard-Seite | A | To Do |
| S1-10 | Frontend: AJAX-Integration Login/Register | A | In Progress |
| S1-11 | Frontend: Logout & Navigation | A | To Do |
| S1-12 | Integration-Test (alle gemeinsam) | All | To Do |

---

### Sprint 2: Produktverwaltung & Admin-Panel
**Story:** "Als Admin möchte ich Produkte einpflegen (mit Bildern), damit User diese kaufen können."

| ID | Task | Person | Status |
|----|------|--------|--------|
| S2-1 | Admin-Flag hinzufügen (DB + User-Klasse) | B | To Do |
| S2-2 | Produkt-Tabelle anlegen | C | To Do |
| S2-3 | Product-Klasse (OOP) | B | To Do |
| S2-4 | File-Upload für Bilder (Speicherung, Validierung) | C | To Do |
| S2-5 | GET /api/products.php (alle zeigen) | B | To Do |
| S2-6 | POST /api/products.php (Admin: erstellen) | B | To Do |
| S2-7 | PUT /api/products/{id}.php (Admin: bearbeiten) | B | To Do |
| S2-8 | DELETE /api/products/{id}.php (Admin: löschen) | B | To Do |
| S2-9 | Frontend: Produktliste mit Bootstrap-Cards | A | To Do |
| S2-10 | Frontend: Produktdetails (Modal) | A | To Do |
| S2-11 | Frontend: Admin-Panel zum Produkte anlegen | A | To Do |
| S2-12 | Frontend: Admin-Panel zum Produkte bearbeiten/löschen | A | To Do |
| S2-13 | Integration-Test | All | To Do |

---

### Sprint 3: Warenkorb, Checkout & Bestellungen
**Story:** "Als User möchte ich Produkte in den Warenkorb legen und eine Bestellung aufgeben."

| ID | Task | Person | Status |
|----|------|--------|--------|
| S3-1 | Warenkorb-Session-Struktur planen | C | To Do |
| S3-2 | Order-Tabellen anlegen (orders, order_items) | C | To Do |
| S3-3 | Order-Klasse (OOP) | B | To Do |
| S3-4 | POST /api/cart/add.php | B | To Do |
| S3-5 | POST /api/cart/remove.php | B | To Do |
| S3-6 | GET /api/cart.php | B | To Do |
| S3-7 | POST /api/orders.php (Bestellung abschicken) | B | To Do |
| S3-8 | Invoice generieren (HTML/PDF) | B + C | To Do |
| S3-9 | Frontend: "In Warenkorb"-Button | A | To Do |
| S3-10 | Frontend: Warenkorb-Seite | A | To Do |
| S3-11 | Frontend: Checkout-Formular | A | To Do |
| S3-12 | Frontend: Bestellbestätigung | A | To Do |
| S3-13 | Frontend: Bestellhistorie im Profil | A | To Do |
| S3-14 | Integration-Test kompletter Flow | All | To Do |

---

### Sprint 4: Gutscheine, Bonus-Features & Polish
**Story:** "Gutscheine sind reif, optionale Features machen den Shop professionell."

| ID | Task | Person | Status |
|----|------|--------|--------|
| S4-1 | Gutschein-Tabelle + Klasse | C | To Do |
| S4-2 | GET /api/coupons/{code}.php (Validieren) | B | To Do |
| S4-3 | POST /api/coupons.php (Admin: erstellen) | B | To Do |
| S4-4 | Rabatt-Berechnung im Warenkorb | B | To Do |
| S4-5 | Frontend: Gutschein-Input im Warenkorb | A | To Do |
| S4-6 | Bonus-Feature 1: [Kategorie-Filter / Suche / Lagerverwaltung / …] | Person | To Do |
| S4-7 | Bonus-Feature 2: [Kategorie-Filter / Suche / Lagerverwaltung / …] | Person | To Do |
| S4-8 | Design-Polish (Responsive, Fehlerbehandlung, User-Feedback) | A | To Do |
| S4-9 | Dead-End-Check: Alle Prozesse sind rund | A | To Do |
| S4-10 | README + API-Dokumentation finalisieren | All | To Do |
| S4-11 | Final-Test & Bug-Fix | All | To Do |

---

## Prioritäten & Story-Points (Optional)

```
🔴 Kritisch (MVP):  Epic 1-6  (Must-Have)
🟡 Wichtig:         Epic 7-8  (Should-Have)
🟢 Bonus:           Epic 9-10 (Nice-to-Have)
```

---

## Abhängigkeits-Graph

```
Sprint 1: User-Auth ✓ (Baseline)
   ↓
Sprint 2: Products ✓ (Admin pflegt Produkte ein)
   ↓
Sprint 3: Cart + Orders ✓ (User kauft)
   ↓
Sprint 4: Coupons + Polish ✓ (Final)
```

**Hinweis:** Einige Tasks laufen parallel (z.B. S1-1 und S1-7), aber es gibt Abhängigkeiten (S1-4 hängt von S1-1 ab).

---

## Definition of Done (Backlog-Level)
- ✓ Task hat Owner (Person zugewiesen)
- ✓ Geschätzter Aufwand (Story Points oder Stunden)
- ✓ Akzeptanzkriterien klar
- ✓ Keine Blockers
- ✓ Code ist reviewt
- ✓ Tests sind geschrieben (zumindest manuell)

