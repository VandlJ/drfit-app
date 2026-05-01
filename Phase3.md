### Fáze 3: Architecture & Prompting

Tady je plán, se kterým v pátek v 10:00 otevřeme terminál. 

#### 1. Datový model & Architektura (React Context)
Vystačíme si s jednoduchým globálním statem.
*   **User State:** Uložíme si `name`, `email` a `creditCode` (to je ten identifikátor z URL).
*   **Active Training State:** Objekt s aktuálním tréninkem: `startTime`, `endTime`, `doorPin`. Pokud je null, nesvítí PIN.
*   **Routing (Expo Router):** 
    *   `/(auth)/login` (Zadání kódu nebo vložení URL)
    *   `/(tabs)/dashboard` (Ten náš "killer" view s PINem a odpočtem)
    *   `/(tabs)/booking` (Zde bude to WebView)
    *   `/(tabs)/support` (Kontakty)

#### 2. Master Prompt (Startovací motor)
V pátek v 10:00 vezmeš tento prompt, hodíš ho do Claude Code a půjdeš si pro kávu. Tohle nám vygeneruje kostru celé aplikace. (Záměrně do něj vkládám tvé pravidlo ohledně anglických komentářů v kódu).

> **MASTER PROMPT PRO CLAUDE CODE:**
> "Initialize the core architecture for the DrFit MVP using Expo Router. 
> 1. Set up a tab-based navigation with three main tabs: Dashboard, Booking, and Support.
> 2. Create an Auth flow that checks `expo-secure-store` for a saved `creditCode`. If none exists, show a simple login screen with one input for the code.
> 3. Implement a global React Context (`AuthContext`) to manage the user state and active training data (mock the training data for now: valid from 10 mins ago to 50 mins from now, with PIN '548655').
> 4. On the Dashboard screen, implement `expo-local-authentication`. Require FaceID/TouchID before revealing the active training PIN. Once authenticated, display a massive PIN code and a visual circular countdown timer based on the training's end time.
> 5. Create the Booking tab using `react-native-webview` pointing to a placeholder URL.
> 6. Create the Support tab with static text and `Linking` to a dummy phone number and email.
> STRICT RULES: All code comments MUST be in English. Rely on built-in `expo-*` modules. Ensure UI looks native and snappy."
