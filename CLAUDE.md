# Context & Guidelines: DrFit Hackathon App

## Role & Objective
Expert Principal React Native & Expo Developer building an MVP for a private fitness center (DrFit) during a 7-hour hackathon.
Priority: Speed, snappy UX, and native feel. Not building a scalable backend today. "Fake it till you make it" is the accepted strategy for data persistence.

## Tech Stack
- **Expo SDK:** 55 (Latest)
- **React Native:** 0.81.5
- **React:** 19.1.0
- **Engine:** New Architecture (Fabric) is ENABLED
- **Routing:** Expo Router (file-based)
- **Styling:** NativeWind v4 (Tailwind for React Native)
- **UI Components:** React Native Paper (inputs/modals) + Lucide React Native (icons)
- **Native Modules:** `expo-local-authentication` (Face ID), `expo-calendar`, `expo-notifications`, `@stripe/stripe-react-native` (Apple Pay)

## Environment & Testing Strategy
- **Primary dev:** iOS Simulator on macOS
- **Physical dev:** iPad Pro connected via cable using Expo Go
  - Warning: Stripe and Face ID do not work in Expo Go. Wrap native module initializations in `try/catch` or guard with an environment check so the app does not crash on the iPad.
- **Production:** EAS Build → TestFlight (Apple Developer Account provided later)

## Build & Deployment
- **Dev build (required for Face ID + Apple Pay):** `npx expo run:ios`
- **After adding packages or config plugins:** `npx expo prebuild --clean && npx expo run:ios`
- **EAS TestFlight build:** `npx eas-cli@latest build --platform ios`
- **EAS build + auto-submit:** `npx eas-cli@latest build --platform ios -s`
- **Check dependency health:** `npx expo install --check`
- **Fix invalid package versions:** `npx expo install --fix`

### EAS profiles (`eas.json`)
| Profile | Distribution | Use |
|---|---|---|
| `development` | Internal | Dev client builds |
| `preview` | Internal | Stakeholder testing |
| `production` | App Store | TestFlight / release |

## Golden Rules for Code Generation
1. **Language:** ALL comments and documentation MUST be in English. Variables and function names must be semantic English.
2. **Styling:** Use NativeWind (`className`) exclusively. Do not use `StyleSheet.create` unless strictly required by a third-party library or for complex animations.
3. **Simplicity:** Functional components and React Hooks only. No class components.
4. **State:** React Context for global state (Auth, Credits). Do not install Redux or Zustand.
5. **Mocking:** Do not write fetch calls to non-existent APIs. Mock data structures (arrays/objects) directly in Context or components.
6. **Execution:** Use "Plan and Execute" approach for large changes — propose a plan and wait for user approval before overwriting files.

## Constraints & Rules
- Do NOT use deprecated libraries. Always prefer built-in Expo modules (`expo-*`).
- Focus on shipability and clean, pragmatic components. Do not over-engineer.
- Do not hardcode API keys. Use `.env` with `EXPO_PUBLIC_` prefix for client-side keys.
- Secret keys (Stripe secret, backend tokens) must never appear in the app bundle.

## Key Implementation Notes
See `IMPLEMENTATION_CONTEXT.md` for detailed Face ID and Apple Pay implementation patterns,
including the React 19 `forwardRef` shim, bare-workflow entitlements gotcha, and pre-ship checklist.
