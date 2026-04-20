# **TechShop**

### **Beschreibung**

TechShop ist ein Webshop-Projekt, bei dem Nutzer Produkte durchsuchen, in einen Warenkorb legen und Bestellungen verwalten können.

---

### **Funktionen**

* Produktübersicht anzeigen
* Produktdetails anzeigen
* Warenkorb verwalten
* Produkte hinzufügen und entfernen
* Benutzer-Login (optional)
* Backend mit Datenbank

---

### **Technologien**

* HTML
* CSS
* JavaScript
* Backend: z. B. Node.js oder PHP
* Datenbank: z. B. MySQL

---

### **Aktueller Stand (Auth-Frontend)**

* Bootstrap-Layout mit Header, Navigation, Hauptbereich und Footer erstellt.
* Login-Formular und Register-Formular mit einfacher Umschaltung per Navigation umgesetzt.
* Anbindung per jQuery AJAX:
	* `POST /api/login.php` mit E-Mail und Passwort
	* `POST /api/register.php` mit Username, E-Mail und Passwort
* Serverantworten (JSON) werden als Erfolg oder Fehler direkt auf der Seite angezeigt.

---

### **Projektstruktur**

* `/frontend` → Benutzeroberfläche (HTML, CSS, JS)
* `/backend` → Server und Datenbank
* `/docs` → Projektplanung (Backlog, Sprint-Plan, Meilensteine)

---

### **Team**

* Mishref → Frontend
* Peter → Datenbank & Fullstack
* Markus → Backend
