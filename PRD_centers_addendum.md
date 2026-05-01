# PRD Addendum – Multi-Center Support

Extends the base PRD. All existing screens and flows remain unchanged unless explicitly noted below.

---

## Onboarding změna

**Screen: `/onboarding`**

Po welcome screenu přidat krok výběru home gymu před přihlášením:

```
┌─────────────────────────────┐
│  Vyber své fitness centrum  │
│                             │
│  ┌──────────────────────┐   │
│  │ 📍 Fitness Plzeň     │   │  ← karta centra
│  │    Centrum           │   │
│  │    Náměstí Republiky │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ 📍 Fitness Plzeň     │   │
│  │    Slovany           │   │
│  │    Slovanská alej    │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

- Výběr uloží `defaultCenterId` do profilu uživatele (`PATCH /auth/me`)
- Tento krok se zobrazí pouze při prvním přihlášení (pokud uživatel nemá `defaultCenter`)

---

## Home Dashboard změna

**Screen: `/home`**

Přidat přepínač centra v hlavičce:

```
┌─────────────────────────────┐
│  Ahoj, Adam 👋              │
│  📍 Fitness Centrum    ▼    │  ← tapnutím otevře center picker
└─────────────────────────────┘
```

- Tapnutí otevře bottom sheet se seznamem center
- Výběr jiného centra → `PATCH /auth/me` s novým `defaultCenterId` → refresh rezervací
- Aktivní centrum je vidět i na kartách rezervací (malý label pod časem)

---

## Booking změna

**Screen: `/booking/new`**

- Výběr slotů automaticky filtruje podle aktuálně vybraného centra (`defaultCenter`)
- Přidat možnost centrum před výběrem slotu změnit (dropdown v headeru screenu)
- V souhrnu rezervace zobrazit i název a adresu centra

---

## Profil / Nastavení

Přidat jednoduchou **Settings screen** `/settings`:

- Zobrazí aktuální home gym s možností změny
- Tapnutí → center picker bottom sheet → uloží nový default
- Odkaz na Feedback (přesun z navigace sem, uvolní místo)

---

## Navigace update

```
(tabs)
├── /home          # Dashboard (filtrovaný dle defaultCenter)
├── /booking/new   # Nová rezervace
├── /credits       # Kredity
├── /history       # Historie
└── /settings      # Nastavení + home gym + feedback
```

---

## API volání – co se mění pro mobilní appku

| Původní | Nové |
|---------|------|
| `GET /slots?date=X` | `GET /slots?date=X&centerId=Y` |
| `GET /auth/me` vrací profil | Nově obsahuje `defaultCenter: { id, name }` |
| – | `PATCH /auth/me` body `{ defaultCenterId }` pro změnu home gymu |
| – | `GET /centers` pro seznam center v pickeru |
