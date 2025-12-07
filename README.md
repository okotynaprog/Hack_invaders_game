# 🚀 Hack Invaders: The Dopamine Engine

**Hack Invaders** to dynamiczna gra webowa z segmentu arcade, stworzona z myślą o graczach, którzy cenią sobie ciągłą akcję i szybkie nagrody. Nasz projekt nie jest tylko grą – to starannie zaprojektowany model angażujący, mający na celu wywoływanie szybkich **wybuchów dopaminowych** i maksymalizowanie retencji.

## ✨ Kluczowy Model Biznesowy: Play-to-Earn (P2E)

### 💎 Diamenty – Waluta Przyszłości
Rdzeniem monetyzacji jest system **Diamentów** (Hard Currency). Jest to unikalna waluta, która pełni dwojaką rolę:

* **Cash-Out:** Diamenty można **wypłacać na realne pieniądze** (FIAT), nagradzając najbardziej zaangażowanych graczy.
* **Wzmocnienie Angażu:** Diamenty są używane do nabywania ekskluzywnych dóbr w grze.

### 💰 Mechanizmy Monetyzacji i Nagradzania
System nagradzania jest kalibrowany tak, aby stale zachęcać gracza do powrotu i zwiększania inwestycji:

* **Skiny i Ulepszenia:** Unikalne skórki i ulepszenia broni.
* **Eventy Specjalne:** Ograniczone czasowo wydarzenia, takie jak **CashOut** czy **Extra Events**, zwiększające szansę na zdobycie Diamentów.
* **Mechanizmy Wzmacniania:** Możliwość wprowadzenia dodatkowych systemów, takich jak **FreeBet**, które oferują codzienne, darmowe szanse na wysoką wygraną.

> **CEL:** Model gry zaprojektowany tak, aby wciągać gracza do szybkiej i intensywnej rozgrywki, celowo uzależniający poprzez wywoływanie szybkich wybuchów dopaminowych.

## 🛠️ Stos Technologiczny (Tech Stack)

Aplikacja została zaprojektowana jako w pełni **responsywna** platforma webowa, zapewniająca płynne działanie na urządzeniach mobilnych i desktopach.

* **Frontend:** **React** – dla wydajnego i komponentowego UI.
* **Stylizacja:** **TailwindCSS** – dla szybkiej, responsywnej i modularnej stylizacji.
* **Backend & Logika:** **Node.js** – do obsługi bezpiecznej ekonomii, zarządzania Diamentami, transakcjami i logiką eventów.
* **Baza Danych:** *[Miejsce na wybraną bazę danych: np. MongoDB, PostgreSQL]*
========================================

## Run Locally (musimy być zainstalowany NODE JS)

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`

2. Run the app:
   `npm run dev`

========================================

# Hack Invaders - Backend API

Serwer backendowy dla gry **Hack Invaders: Reborn**. Obsługuje uwierzytelnianie użytkowników (JWT), synchronizację postępów w grze, sklep z przedmiotami oraz globalny ranking, wykorzystując bazę danych **PostgreSQL**.

## 🛠️ Wymagania Techniczne

*   **Node.js** (v14+)
*   **PostgreSQL** (v12+)
*   **Menedżer pakietów:** npm lub yarn

## 🚀 Instalacja i Uruchomienie

1.  Przejdź do katalogu backendu:
    ```bash
    cd backend
    ```

2.  Zainstaluj zależności (przykładowy stack: Express + Sequelize/pg):
    ```bash
    npm install express cors pg pg-hstore sequelize dotenv jsonwebtoken bcryptjs body-parser
    ```

3.  Skonfiguruj zmienne środowiskowe. Utwórz plik `.env` w katalogu `backend/` i wklej:
    ```env
    PORT=4000
    # Format: postgres://uzytkownik:haslo@host:port/nazwa_bazy
    DATABASE_URL=postgres://postgres:password@localhost:5432/hackinvaders
    JWT_SECRET=twoj_bardzo_tajny_klucz_jwt_secrecik_123
    ```

4.  Uruchom serwer:
    ```bash
    npm start
    # lub dla trybu deweloperskiego:
    npm run dev
    ```

Serwer domyślnie startuje pod adresem: `http://localhost:4000`

---

## 📡 Dokumentacja API

Backend wystawia REST API pod prefiksem `/api`. Frontend oczekuje następujących endpointów:

### 🔐 Auth (Uwierzytelnianie)

| Metoda | Endpoint | Opis | Body (JSON) | Odpowiedź |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Rejestracja nowego użytkownika | `{ "username": "Neo", "password": "123", "email": "neo@matrix.com" }` | `{ "token": "...", "user": { ... } }` |
| `POST` | `/auth/login` | Logowanie użytkownika | `{ "username": "Neo", "password": "123" }` | `{ "token": "...", "user": { ... } }` |

### 💾 Data Sync (Synchronizacja Danych)

Wymaga nagłówka: `Authorization: Bearer <token>`

| Metoda | Endpoint | Opis | Body (JSON) | Odpowiedź |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/data/sync` | Zapisuje postępy po grze | `{ "credits": 1500, "highscoreSession": 500, "totalMbCollected": 0 }` | `{ "success": true, "user": { ...updatedUser } }` |
| `GET` | `/data/leaderboard` | Pobiera listę top graczy | *(brak)* | `{ "leaderboard": [ { "username": "Neo", "credits": 20000, ... }, ... ] }` |

### 🛒 Shop (Sklep)

Wymaga nagłówka: `Authorization: Bearer <token>`

| Metoda | Endpoint | Opis | Body (JSON) | Odpowiedź |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/shop/buy` | Zakup skórki | `{ "skinId": "neon", "cost": 2500 }` | `{ "success": true, "user": { ... } }` |
| `POST` | `/shop/equip` | Wyposażenie skórki | `{ "skinId": "neon" }` | `{ "success": true, "user": { ... } }` |

---

## 📦 Struktura Bazy Danych (SQL)

Poniżej znajduje się sugerowana struktura tabeli `users` w PostgreSQL. Jeśli używasz ORM (np. Sequelize lub TypeORM), model powinien to odzwierciedlać.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    credits INTEGER DEFAULT 500,        -- Waluta (Diamenty)
    high_score INTEGER DEFAULT 0,       -- Najlepszy wynik sesji
    
    -- Przechowywanie tablicy stringów (lub JSONB)
    unlocked_skins TEXT[] DEFAULT ARRAY['default'], 
    -- ALTERNATYWNIE DLA JSONB: unlocked_skins JSONB DEFAULT '["default"]'::jsonb,
    
    equipped_skin VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Obsługa tablic (Unlocked Skins)
Frontend wysyła i oczekuje tablicy stringów (np. `['default', 'neon']`). 
*   W **PostgreSQL** możesz użyć typu `TEXT[]` lub `JSONB`.
*   Upewnij się, że Twój backend poprawnie parsuje te dane przed wysłaniem ich jako JSON do frontendu.

## ⚠️ Obsługa Błędów

API powinno zwracać błędy w formacie JSON z odpowiednimi kodami HTTP:

```json
{
  "message": "Użytkownik o takiej nazwie już istnieje"
}
```
