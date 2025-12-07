-- Utworzenie Schematu Bazy Danych dla ECHO: Void Scavenger

-- Tabela 1: Użytkownicy (Przechowuje konta i hashe)
CREATE TABLE users (
                       user_id SERIAL PRIMARY KEY, -- Automatycznie generowany ID
                       username VARCHAR(50) UNIQUE NOT NULL, -- Nazwa musi być unikalna i niepusta
                       email VARCHAR(100) UNIQUE,
                       password_hash VARCHAR(255) NOT NULL, -- Tutaj przechowujemy hasło zaszyfrowane BCryptem
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela 2: Dane Graczy (Przechowuje wyniki i waluty)
-- Używamy FOREIGN KEY, aby powiązać dane z konkretnym użytkownikiem.
CREATE TABLE player_data (
                             data_id SERIAL PRIMARY KEY,
                             user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE, -- Powiązanie z tabelą users

    -- WALUTA GRY (Soft Currency)
                             total_mb_collected INTEGER DEFAULT 0, -- Całkowity wynik (ekwiwalent MB z localStorage)

    -- WALUTA PREMIUM (Hard Currency)
                             credits INTEGER DEFAULT 100,         -- Kredyty kupowane (dajemy 100 na start)

    -- Inne statystyki (dla leaderboards)
                             high_score_session INTEGER DEFAULT 0, -- Najwyższy wynik w pojedynczej sesji
                             last_synced TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

                             UNIQUE (user_id) -- Zapewnia, że każdy użytkownik ma tylko jeden wiersz z wynikami
);

-- Indeksy dla szybkiego wyszukiwania
CREATE INDEX idx_user_id ON player_data(user_id);
CREATE INDEX idx_high_score ON player_data(high_score_session DESC); -- Dla tabeli wyników
