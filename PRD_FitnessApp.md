# PRD – Private Fitness Center Client App
**Version:** 1.0  
**Platform:** iOS (Expo React Native, iOS-first)  
**Goal:** Odstranit frustraci z hledání PINů v SMS/e-mailech a přinést do privátního fitness plynulý, prémiový zážitek odpovídající kvalitě samotné služby.

---

## 1. Overview

Mobilní aplikace pro klienty privátního fitness centra. Centrum funguje na principu rezervace celého prostoru pro jednoho klienta (žádný personál, placený hodinový slot). Přístup je řízen 6místným číselným PINem. Cílem aplikace je celý tento flow – rezervace, platba, vstup, trénink, odchod – zjednodušit do jednoho plynulého prémiového zážitku.

---

## 2. Tech Stack

| Vrstva | Technologie |
|--------|-------------|
| Mobile | Expo React Native (SDK 51+), TypeScript |
| Navigation | Expo Router (file-based) |
| Auth | Custom JWT (email+heslo) + Expo LocalAuthentication (Face ID/Touch ID) |
| Push notifications | Expo Notifications + APNs |
| Live Activities / Dynamic Island | `expo-live-activities` nebo nativní modul přes Expo Config Plugin |
| Payments | Stripe SDK (React Native) – Apple Pay přes Stripe |
| Backend | Node.js + Express (nebo Fastify), PostgreSQL |
| State management | Zustand |
| Styling | NativeWind (Tailwind pro React Native) nebo StyleSheet |

---

## 3. Feature Prioritization

### 🔴 P1 – Core (MVP, bez tohohle appka nedává smysl)

1. Email/heslo login + Face ID pro opakovaný přístup  
2. Dashboard s rezervacemi (nejbližší největší, ostatní pod ní)  
3. Vytvoření nové rezervace (výběr slotu z kalendáře)  
4. Kreditový systém – nákup kreditů přes Apple Pay, platba slotu z kreditů  
5. PIN displej v aplikaci (zobrazení 6místného kódu před vstupem)  
6. Push notifikace (1 hodina před, 1 minuta před s PINem)  
7. Aktivní trénink – timer s odpočtem zbývajícího času  
8. Historie rezervací (záložka v navigaci)  
9. Zrušení rezervace → vrácení kreditů na účet  

### 🟡 P2 – Secondary (přidají wow-faktor, ale MVP funguje bez nich)

10. Dynamic Island – živý odpočet zbývajícího času tréninku  
11. Lock screen Live Activity widget – timer na zamčené obrazovce  
12. Give Feedback stránka  

---

## 4. Screens & User Flows

### 4.1 Onboarding & Auth

**Screen: `/onboarding`**
- Zobrazuje se pouze při prvním spuštění aplikace
- Full-screen welcome s logem / brandingem centra

**Screen: `/login`**
- Email + heslo input
- Submit → backend vrátí JWT, uloží se do SecureStore
- Po úspěšném loginu → dotaz, zda zapnout Face ID (pokud zařízení podporuje)
- Face ID preference uložena lokálně

**Flow opakovaného přístupu:**
1. App launch → zkontroluje, zda existuje platný JWT v SecureStore
2. Pokud ano a Face ID je zapnuto → `LocalAuthentication.authenticateAsync()`
3. Úspěch → přesměrování na `/home`
4. Neúspěch / Face ID není dostupný → zobrazí login screen s možností zadat heslo

**Logout:**
- Smaže JWT ze SecureStore, zakáže Face ID flag, přesměruje na `/login`

---

### 4.2 Home – Dashboard rezervací

**Screen: `/home`**

**Layout:**
```
┌─────────────────────────────┐
│  Ahoj, [Jméno] 👋           │
│                             │
│  ┌─── NEJBLIŽŠÍ REZERVACE ──┤  ← velká karta (hero card)
│  │  Pátek 9. 5.             │
│  │  10:00 – 11:00           │
│  │  [ZOBRAZIT PIN]  [Timer] │
│  └─────────────────────────┘
│                             │
│  Nadcházející               │
│  ┌──────────────────────┐   │  ← menší karty
│  │ St 14. 5. | 14:00   │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ Po 19. 5. | 08:00   │   │
│  └──────────────────────┘   │
│                             │
│  [+ Nová rezervace]         │
└─────────────────────────────┘
```

**Logika PIN zobrazení:**
- PIN se zobrazí v hero cardě **nejdříve 30 minut před začátkem** slotu
- Před tímto časem je PIN skrytý (`••••••`)
- Po zobrazení: velké, čitelné číslice, možnost zkopírovat do clipboardu

**Stav hero cardy dle času:**
| Čas | Zobrazení |
|-----|-----------|
| > 30 min před | Datum, čas, skrytý PIN |
| 30–0 min před | Datum, čas, **viditelný PIN**, tlačítko "Jdu na trénink" |
| Probíhající slot | **Aktivní timer** (odpočet do konce) |
| Po skončení | Přesune se do Historie |

---

### 4.3 Nová rezervace

**Screen: `/booking/new`**

**Flow:**
1. **Výběr data** – horizontální scrollovatelný kalendář (týdenní pohled), zvýraznění dostupných dní
2. **Výběr slotu** – seznam dostupných hodinových slotů pro vybraný den (volné/obsazené)
3. **Souhrn** – datum, čas, cena v kreditech
4. **Potvrzení** – tlačítko "Zarezervovat za X kreditů"
   - Pokud má uživatel dostatek kreditů → odečte kredity, vytvoří rezervaci, vrátí na `/home`
   - Pokud nemá dostatek kreditů → zobrazí modal "Nemáte dostatek kreditů" s CTA "Dobít kredity"

**Backend API:**
- `GET /slots?date=YYYY-MM-DD` → seznam slotů (volné/obsazené)
- `POST /reservations` → vytvoří rezervaci (odečte kredity)

---

### 4.4 Kreditový systém

**Screen: `/credits`**

**Zobrazení:**
- Aktuální zůstatek kreditů (velké číslo, prominentně)
- Historie transakcí (dobití, utracení, vrácení)
- Tlačítko "Dobít kredity"

**Screen: `/credits/topup`**

**Cenové balíčky (příklady):**
| Balíček | Cena | Kredity | Bonus |
|---------|------|---------|-------|
| Starter | 500 Kč | 500 kreditů | – |
| Standard | 1 000 Kč | 1 000 kreditů | – |
| Premium | 2 000 Kč | 2 000 kreditů | +200 (10% bonus) |
| Pro | 5 000 Kč | 5 000 kreditů | +750 (15% bonus) |

> Bonusy jsou konfigurovatelné z admin rozhraní (backend).

**Platba:**
- Apple Pay přes Stripe
- Po úspěšné platbě → kredity ihned připsány na účet
- Potvrzovací obrazovka s animací

**Zrušení rezervace:**
- Kredity vráceny na účet okamžitě (plná výše)
- Pokud zrušení méně než X hodin před začátkem → lze nastavit storno poplatek (konfigurovatelné)
- Žádné bankovní převody, pouze kreditový zůstatek

**Backend API:**
- `GET /credits/balance` → aktuální zůstatek
- `GET /credits/history` → transakční historie
- `POST /credits/topup` → inicializace Stripe platby
- `POST /reservations/:id/cancel` → zrušení, vrácení kreditů

---

### 4.5 Aktivní trénink – Timer

**Trigger:** Uživatel vstoupí do slotu (čas >= začátek rezervace)  
**Zobrazení:** Automaticky na home dashboardu místo hero karty s PINem

**Timer komponenta:**
```
┌────────────────────────────┐
│  🏋️  TRÉNINK PROBÍHÁ       │
│                            │
│       45:32                │  ← MM:SS odpočet
│    zbývá do konce          │
│                            │
│  [━━━━━━━━━░░░░░░░]        │  ← progress bar
│  10:00 → 11:00             │
└────────────────────────────┘
```

**Upozornění před koncem:**
- **10 minut před koncem** → push notifikace: "Za 10 minut končí tvůj slot, čas se jít převléct 👕"
- **5 minut před koncem** → in-app banner (pokud je app otevřená)

---

### 4.6 Historie rezervací

**Screen: `/history`**

- Seznam minulých rezervací seřazených od nejnovější
- Každá položka: datum, čas, trvání, stav (Dokončeno / Zrušeno)
- Jednoduchý list, žádná extra funkcionalita v P1

---

### 4.7 Give Feedback (P2)

**Screen: `/feedback`**

- Hvězdičkové hodnocení (1–5)
- Volitelný textový komentář
- Tlačítko odeslat
- Potvrzovací zpráva po odeslání

**Backend API:**
- `POST /feedback` → uloží hodnocení

---

## 5. Push Notifications

**Implementace:** Expo Notifications + APNs (pro iOS)  
**Timing je řešen na backendu** (scheduled jobs / cron).

| Trigger | Čas | Obsah |
|---------|-----|-------|
| Připomínka | 60 min před začátkem | "Nezapomeň – máš fitko za hodinu 💪" |
| PIN notifikace | 5 min před začátkem | "Tvůj PIN: **[123456]** – Hodně zdaru! 🔑" |
| Konec slotu | 10 min před koncem | "Za 10 minut ti končí slot, čas se jít převléct 👕" |

**Setup:**
- Expo push token uložen na backendu při loginu / registraci
- Nutný `expo-notifications` a konfigurace APNs certifikátu

---

## 6. Live Activities & Dynamic Island (P2)

**Implementace:** `expo-live-activities` (nebo custom native module s Expo Config Plugin)  
**Platforma:** iOS 16.1+ (Live Activities API)

**Spuštění Live Activity:**
- Při začátku tréninku (čas >= začátek slotu) app spustí Live Activity
- Payload: `startTime`, `endTime`, název centra

**Lock screen widget:**
```
[🏋️ Fitness | 42 min zbývá ━━━━░░ 10:00–11:00]
```

**Dynamic Island (kompaktní):**
```
[🏋️ 42:15]
```

**Dynamic Island (rozšířený, po podržení):**
```
┌──────────────────────┐
│ 🏋️ Fitness           │
│ Zbývá: 42:15         │
│ ━━━━━━░░░░ 10–11 hod │
└──────────────────────┘
```

**Ukončení:** Po skončení slotu se Live Activity automaticky ukončí (backend pošle update nebo app detekuje konec v background task).

---

## 7. Backend API – Přehled endpointů

### Auth
| Method | Endpoint | Popis |
|--------|----------|-------|
| POST | `/auth/login` | Email + heslo → JWT |
| POST | `/auth/logout` | Invalidace tokenu |
| GET | `/auth/me` | Profil přihlášeného uživatele |

### Rezervace
| Method | Endpoint | Popis |
|--------|----------|-------|
| GET | `/slots?date=YYYY-MM-DD` | Dostupné sloty |
| GET | `/reservations` | Všechny rezervace uživatele |
| POST | `/reservations` | Vytvoření rezervace |
| DELETE | `/reservations/:id` | Zrušení rezervace (vrátí kredity) |
| GET | `/reservations/:id/pin` | Získání PINu (jen 30 min před začátkem) |

### Kredity
| Method | Endpoint | Popis |
|--------|----------|-------|
| GET | `/credits/balance` | Aktuální zůstatek |
| GET | `/credits/history` | Historie transakcí |
| POST | `/credits/topup` | Stripe PaymentIntent |
| POST | `/credits/topup/confirm` | Potvrzení platby (Stripe webhook) |

### Notifikace
| Method | Endpoint | Popis |
|--------|----------|-------|
| POST | `/notifications/token` | Registrace Expo push tokenu |

### Feedback (P2)
| Method | Endpoint | Popis |
|--------|----------|-------|
| POST | `/feedback` | Odeslání hodnocení |

---

## 8. Datový model (zjednodušený)

```sql
-- Uživatelé
users (id, email, password_hash, name, phone, created_at)

-- Kredity
credit_accounts (id, user_id, balance)
credit_transactions (id, user_id, amount, type[topup|spend|refund|bonus], reference_id, created_at)

-- Sloty (definice dostupných časů)
slots (id, date, start_time, end_time, price_credits, is_available)

-- Rezervace
reservations (id, user_id, slot_id, status[active|completed|cancelled], pin, credits_spent, created_at)

-- Push tokeny
push_tokens (id, user_id, token, platform, created_at)

-- Feedback (P2)
feedback (id, user_id, reservation_id, rating, comment, created_at)
```

---

## 9. Bezpečnost & edge cases

- **PIN ochrana:** PIN endpoint vrátí 403 pokud je více než 30 minut do začátku slotu
- **Kredit race condition:** Odečítání kreditů musí být atomická DB transakce (prevent double-spend)
- **JWT expiration:** Token expiruje po 30 dnech, refresh token pro prodloužení
- **Face ID fallback:** Vždy musí existovat možnost přihlásit se heslem (Face ID je convenience, ne jediná cesta)
- **Stripe webhook validace:** Podpis Stripe webhooku musí být ověřen před připsáním kreditů
- **Offline stav:** Aplikace zobrazí cached data a upozorní na offline stav, PIN musí být cachován lokálně po odblokování (30 min před)

---

## 10. App Navigation Structure

```
(tabs)
├── /home                    # Dashboard s rezervacemi
├── /booking
│   ├── /new                 # Výběr slotu
│   └── /confirm             # Souhrn před rezervací
├── /credits
│   ├── /index               # Zůstatek + historie
│   └── /topup               # Nákup kreditů
├── /history                 # Minulé rezervace
└── /feedback                # (P2) Give feedback

(auth)
├── /login
└── /onboarding
```

---

## 11. Success Metrics

| Metrika | Cíl |
|---------|-----|
| Čas od otevření appky k zobrazení PINu | < 3 sekundy |
| Úspěšnost Face ID loginu | > 95 % |
| Crash rate | < 0.1 % sessions |
| Push notification delivery rate | > 98 % |
| Průměrné hodnocení (Feedback) | > 4.5 / 5 |

---

## 12. Out of Scope (v1)

- Android verze (iOS first, Android v dalším releasu)
- Admin panel pro správce fitka (řeší se separátně)
- Systém členství / subscription
- Skupinové rezervace
- Integrace s fitness trackery (Apple Health atd.)
- Správa profilu / změna hesla (basic verze, nízká priorita)
