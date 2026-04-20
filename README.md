# **TechShop**

Ein moderner E-Commerce-Webshop mit strikter Frontend/Backend-Trennung (JSON API). Entwickelt im Team mit 4 Sprints.

---

## 📋 Projektübersicht

### **Beschreibung**
TechShop ist ein **Webshop-Projekt** für das Uni-Fach Webtechnologien / Web Scripting. Der Shop deckt die komplette E-Commerce Pipeline ab:
- Benutzerverwaltung (Login, Register, Profil)
- Produktverwaltung (Admin-Panel mit File-Upload)
- Warenkorb + Checkout
- Bestellung & Rechnungsstellung
- Gutschein-System

---

## 🎯 Kern-Anforderungen

✅ **Basis-Features (Sprint 1-3):**
- Präsentation und Verwaltung von Produkten
- Warenkorbfunktionalität
- Kundenverwaltung
- Bestellungen & Rechnungen
- Gutscheine verwalten und einlösen
- Administrationsbereich

🟢 **Bonus-Features (Sprint 4):**
- Kategorien/Filter
- Suchfunktion
- Lagerverwaltung
- Kundenbewertungen
- Admin-Dashboard (Statistiken)
- uvm.

---

## 🛠 Technologie-Stack

| Layer | Tech |
|-------|------|
| **Frontend** | HTML, CSS (Bootstrap 5), JavaScript (jQuery, AJAX) |
| **Backend** | PHP (OOP, PDO) |
| **Datenbank** | MySQL / MariaDB |
| **API** | REST-ähnlich (JSON Request/Response) |

---

## 📁 Projektstruktur

```
Techshop/
├── README.md                 # Diese Datei
├── SPRINT_1.md              # Sprint 1: User-Authentication
├── BACKLOG.md               # Komplettes Product Backlog (alle 4 Sprints)
├── MILESTONES.md            # Meilensteine & Iterationsplan
├── API_DOCUMENTATION.md     # API-Spezifikation (wird gefüllt)
│
├── index.html               # Hauptseite (Login, Register, Dashboard)
├── css/
│   └── style.css            # Responsive Design
├── js/
│   └── app.js               # Frontend-Logik (jQuery + AJAX)
│
├── backend/
│   ├── api/
│   │   ├── register.php     # POST: Benutzererstellung
│   │   ├── login.php        # POST: Authentifizierung
│   │   ├── logout.php       # POST: Session beenden
│   │   ├── products.php     # GET/POST/PUT/DELETE Produkte
│   │   ├── cart/
│   │   │   ├── add.php      # POST: In Warenkorb
│   │   │   └── remove.php   # POST: Aus Warenkorb
│   │   ├── orders.php       # GET/POST Bestellungen
│   │   ├── coupons.php      # GET/POST Gutscheine
│   │   └── invoices.php     # GET Rechnungen
│   │
│   ├── classes/
│   │   ├── Database.php     # DB-Service (zentrale Klasse)
│   │   ├── User.php         # User-Logik
│   │   ├── Product.php      # Produkt-Logik
│   │   ├── Cart.php         # Warenkorb-Logik
│   │   ├── Order.php        # Bestellungs-Logik
│   │   ├── OrderItem.php    # Bestellposition-Logik
│   │   ├── Invoice.php      # Rechnungs-Generierung
│   │   └── Coupon.php       # Gutschein-Logik
│   │
│   ├── config/
│   │   └── config.php       # DB-Credentials, Konstanten
│   │
│   ├── uploads/
│   │   └── products/        # Produktbilder (sicher ablegen)
│   │
│   └── db/
│       └── schema.sql       # DB-Struktur (CREATE TABLE Statements)
```

---

## 👥 Team & Rollen

| Person | Rolle | Fokus |
|--------|-------|-------|
| **Person A** | Frontend Developer | HTML, CSS, JavaScript, UI/UX, AJAX |
| **Person B** | Backend Developer | PHP-API, OOP-Klassen, Business-Logik |
| **Person C** | Database & Fullstack | DB-Design, DB-Service, File-Uploads, Koordination |

---

## 📅 Sprint-Planung (4 Wochen)

### **Sprint 1: Fundament & User-Auth** (Week 1)
→ [SPRINT_1.md](SPRINT_1.md)
- ✅ Datenbank + DB-Service-Klasse
- ✅ User-Klasse (Register/Login/Logout)
- ✅ Frontend: Auth-Formulare + Dashboard
- 🎯 **Ziel:** Backend und Frontend können JSON austauschen, User eingeloggt

### **Sprint 2: Produktverwaltung** (Week 2-3)
- ✅ Product-Klasse + Tabelle
- ✅ File-Upload für Produktbilder
- ✅ Admin-Panel
- ✅ Frontend: Produktliste & Details
- 🎯 **Ziel:** Admin kann Produkte anlegen, alle sehen Katalog

### **Sprint 3: Warenkorb + Checkout** (Week 4-5)
- ✅ Cart-Logik + Warenkorb-UI
- ✅ Order-Klasse + Bestellungsprozess
- ✅ Rechnungsgenerierung
- ✅ Frontend: Checkout-Flow
- 🎯 **Ziel:** User können kaufen und kriegen Rechnung

### **Sprint 4: Gutscheine + Polish** (Week 6)
- ✅ Coupon-System
- ✅ Bonus-Features (Kategorien, Suche, etc.)
- ✅ Design-Polish & Error-Handling
- ✅ Dokumentation & Testing
- 🎯 **Ziel:** Shop ist produktionsreif

→ [MILESTONES.md](MILESTONES.md) für Details

---

## ⚡ Aktuelle Sprint-Phase

**📍 Status:** Sprint 1 in Planung

### Completed ✅
- HTML-Struktur (Login/Register Formulare)
- Bootstrap-Styling (responsive Design)
- jQuery AJAX-Anbindung (funktioniert)
- README & Sprint-Dokumentation

### In Progress 🔄
- Person C: DB-Schema & DB-Service-Klasse
- Person B: User-Klasse & API-Endpunkte
- Person A: Dashboard + Logout-Integration

### To Do 📝
- Backend-Testing (mit Postman)
- Frontend-Integration Testing
- Finale Sprint 1 Review

---

## 🚀 Wie starte ich das Projekt?

### **Backend-Setup (Person C)**
```bash
# 1. MySQL-Datenbank erstellen
CREATE DATABASE techshop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. SQL-Schema einspielen
mysql -u root techshop_db < backend/db/schema.sql

# 3. Config anpassen
nano backend/config/config.php  # DB-Credentials eingeben
```

### **Frontend-Setup (alle)**
```bash
# Einfach index.html im Browser öffnen oder:
# Mit Live Server VS Code Extension oder
python -m http.server 8000  # Python 3.x
```

### **Testing**
```bash
# Postman oder curl zum Testen der API:
curl -X POST http://localhost:8000/api/register.php \
  -d "username=test&email=test@mail.com&password=123"
```

---

## 📚 Dokumentation

- **[SPRINT_1.md](SPRINT_1.md)** – Sprint 1 Detailplan (Aufgabenverteilung, DoD)
- **[BACKLOG.md](BACKLOG.md)** – Komplettes Backlog (alle Epics & Stories)
- **[MILESTONES.md](MILESTONES.md)** – Meilensteine & Iterationsplan
- **API_DOCUMENTATION.md** – (wird gewällnissen und Datentypen)

---

## 🔐 Security-Checklist (wichtig!)

- [ ] SQL-Injection verhindern (Prepared Statements)
- [ ] XSS verhindern (User-Input validieren/escapen)
- [ ] Passwörter hashen (password_hash, nicht MD5!)
- [ ] CSRF-Token für POST-Requests (später)
- [ ] Keine DB-Errors zum User sichtbar
- [ ] File-Upload validieren (nur Bilder, max. Größe)
- [ ] Admin-Check auf Backend-Ebene (nicht nur Frontend!)

---

## 📝 Notizen für das Team

### Kommunikation
- **Daily Standup:** 3x pro Woche (5-10 min)
- **Integration-Check:** Funktioniertdiese die API?
- **Sprint Review:** Am Ende jedes Sprints

### Git-Workflow (empfohlen)
```bash
git checkout -b sprint-1-branch
git commit -m "Sprint 1: Implement auth API"
git push origin sprint-1-branch
# → Create Pull Request, Review, dann merge
```

### Code-Style
- **PHP:** Camel-case für Methoden/Properties (`$user->login()`)
- **JS:** jQuery-Konventionen (`$form.on("submit", ...)`)
- **Kommentare:** Englisch oder Deutsch (einheitlich!)

---

## 🎓 Lernziele dieses Projekts

✅ Frontend & Backend korrekt trennen (JSON API)  
✅ OOP in PHP nutzen (Klassen, Vererbung)  
✅ SQL & Datenbank-Design (ER-Modell)  
✅ AJAX & asynchrone Requests  
✅ Sessions & Authentifizierung  
✅ File-Uploads sicher implementieren  
✅ Team-Koordination im Projekt (Git, etc.)  

---

## 📞 Support & Troubleshooting

**Problem:** AJAX-Call gibt 404
- → Check: Läuft der PHP-Server? Stimmt die URL in app.js?

**Problem:** DB-Verbindung fehlgeschlagen
- → Check: Credentials in config.php? MySQL läuft?

**Problem:** Login funktioniert nicht
- → Check: Hat Backend das JSON zurückgegeben? Console-Log!

---

**Status:** 🟢 Project Setup Complete | 🟡 Sprint 1 In Planning | Coming Soon: Sprint 2+

Viel Erfolg beim Entwickeln! 💪
