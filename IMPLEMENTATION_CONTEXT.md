# Implementation Context: Face ID & Apple Pay

> Researched and validated in `/Users/vandlicejan/Desktop/expo-test` (Expo SDK 54, RN 0.81.5, New Architecture enabled).
> Both features require a **development build** — they do not work in Expo Go.

---

## Face ID

### Library
```
expo-local-authentication ~17.0.8
```

### Required `app.json` configuration
The `NSFaceIDUsageDescription` key must be present in the iOS `Info.plist`.
Inject it via `app.json` so it survives `expo prebuild`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSFaceIDUsageDescription": "This app uses Face ID to authenticate you securely."
      }
    }
  }
}
```

Without this key, `authenticateAsync()` returns `error: "missing_usage_description"`
and the app will be **rejected by Apple** on submission.

### Implementation pattern

```tsx
import * as LocalAuthentication from "expo-local-authentication";

const authenticateWithFaceID = async (): Promise<boolean> => {
  // 1. Check hardware availability
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    // Handle: device has no biometric sensor
    return false;
  }

  // 2. Check that the user has enrolled biometric credentials
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    // Handle: user has not set up Face ID / Touch ID in Settings
    return false;
  }

  // 3. Detect whether Face ID or Touch ID is available (for UI labelling only)
  const supportedTypes =
    await LocalAuthentication.supportedAuthenticationTypesAsync();
  const hasFaceID = supportedTypes.includes(
    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
  );

  // 4. Present the biometric prompt
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: hasFaceID ? "Authenticate with Face ID" : "Authenticate",
    // disableDeviceFallback: true — forces biometric-only prompt.
    // Without this, iOS falls back to PIN entry when Face ID fails once.
    // For a gym door PIN use-case this should be true.
    disableDeviceFallback: true,
    cancelLabel: "Cancel",
  });

  return result.success;
};
```

### Key decisions

| Option | Value | Reason |
|---|---|---|
| `disableDeviceFallback` | `true` | Prevents iOS jumping to PIN entry; forces Face ID scan UI |
| `cancelLabel` | `"Cancel"` | Custom cancel button label in the system dialog |

### Error codes to handle

| `result.error` | Meaning |
|---|---|
| `"missing_usage_description"` | `NSFaceIDUsageDescription` missing from `Info.plist` — only happens in Expo Go |
| `"user_cancel"` | User pressed Cancel |
| `"system_cancel"` | OS dismissed the dialog (e.g. app went to background) |
| `"biometry_lockout"` | Too many failed attempts; device temporarily locked |
| `"biometry_not_enrolled"` | No biometrics enrolled (should be caught by `isEnrolledAsync`) |

### Expo Go limitation
Face ID **does not work in Expo Go**. `authenticateAsync()` returns
`error: "missing_usage_description"` because `NSFaceIDUsageDescription` cannot
be injected into the Expo Go container at runtime.

```bash
# Always test Face ID via a development build:
npx expo run:ios
```

---

## Apple Pay

### Library
```
@stripe/stripe-react-native ^0.65.0
```

> **API note:** `useApplePay` was removed in `@stripe/stripe-react-native` v0.38+.
> The unified replacement is `usePlatformPay`, which handles both Apple Pay (iOS) and
> Google Pay (Android) through the same API.

### Required `app.json` configuration

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.drfit"
    },
    "plugins": [
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.yourcompany.drfit",
          "enableGooglePay": false
        }
      ]
    ]
  }
}
```

The config plugin automatically:
- Adds `com.apple.developer.in-app-payments` to the iOS entitlements with the merchant ID
- Modifies `AppDelegate` to initialize Stripe

> **Critical bare-workflow gotcha:** If the `ios/` folder already exists (generated before
> the plugin was added), the entitlements file may remain empty. Run
> `npx expo prebuild --clean` to regenerate native projects and apply the plugin correctly.
> Verify that `ios/<AppName>/<AppName>.entitlements` contains
> `com.apple.developer.in-app-payments` after prebuild.

### Apple Developer setup (production)
1. Create a Merchant ID in [Apple Developer Portal](https://developer.apple.com) → Certificates, Identifiers & Profiles → Identifiers → Merchant IDs
2. The Merchant ID must match exactly across: `app.json` plugin config, `StripeProvider`, and Apple Developer Portal
3. Configure the Merchant ID in your Stripe Dashboard → Settings → Payment methods → Apple Pay

### Root provider setup

```tsx
import { StripeProvider } from "@stripe/stripe-react-native";

export default function App() {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.yourcompany.drfit"
    >
      {/* rest of app */}
    </StripeProvider>
  );
}
```

> Store the publishable key in `.env` as `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
> Never hardcode or commit API keys. The secret key must only live on the backend.

### Implementation pattern

```tsx
import {
  usePlatformPay,
  PlatformPay,
  PlatformPayButton,
} from "@stripe/stripe-react-native";

const PaymentScreen = () => {
  const { isPlatformPaySupported, createPlatformPayPaymentMethod } =
    usePlatformPay();

  // Check Apple Pay availability before showing the button
  const [applePayAvailable, setApplePayAvailable] = React.useState(false);

  React.useEffect(() => {
    isPlatformPaySupported().then(setApplePayAvailable);
  }, []);

  const handleApplePay = async () => {
    const { error, paymentMethod } = await createPlatformPayPaymentMethod({
      applePay: {
        cartItems: [
          {
            label: "DrFit Training Session",
            amount: "299.00",
            paymentType: PlatformPay.PaymentType.Immediate,
          },
        ],
        merchantCountryCode: "CZ",
        currencyCode: "CZK",
      },
    });

    if (error) {
      if (error.code === "Canceled") {
        // User dismissed the sheet — not a real error
        return;
      }
      // Handle actual error
      console.error("Apple Pay error:", error);
      return;
    }

    // Send paymentMethod.id to your backend to confirm the payment
    await confirmPaymentOnBackend(paymentMethod.id);
  };

  if (!applePayAvailable) return null;

  return (
    <PlatformPayButton
      onPress={handleApplePay}
      type={PlatformPay.ButtonType.Pay}
      appearance={PlatformPay.ButtonStyle.Black}
      style={{ width: "100%", height: 50 }}
    />
  );
};
```

### Two approaches for triggering the sheet

| Method | Behavior |
|---|---|
| `isPlatformPaySupported()` | Async check — returns `true` only if device supports Apple Pay AND has at least one card in Wallet |
| `createPlatformPayPaymentMethod()` | Directly presents the native sheet without a pre-check; returns error if not supported |

Use `isPlatformPaySupported()` to conditionally show/hide the Apple Pay button in the UI.
Use `createPlatformPayPaymentMethod()` when the user taps the button.

### Currency & locale for DrFit

```tsx
merchantCountryCode: "CZ",
currencyCode: "CZK",
```

### Error codes to handle

| `error.code` | Meaning |
|---|---|
| `"Canceled"` | User dismissed the sheet — not an error, do nothing |
| `"Failed"` | Generic failure (no cards, device restriction, etc.) |
| `"Unknown"` | Unexpected native error |

---

## React 19 Compatibility Shim

Both `@stripe/stripe-react-native` and `react-native-paper` use the React 18-style
`forwardRef` with a single-parameter render function. React 19 added a strict check
that fires a console error for this pattern at module-load time.

Create `suppress-logs.ts` and import it as the **first import** in `App.tsx`:

```ts
// suppress-logs.ts
// Must be the FIRST import in App.tsx.
// Patches console.error before any library loads.
const _consoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("forwardRef render functions accept exactly two parameters")
  ) {
    return;
  }
  (_consoleError as (...a: unknown[]) => void)(...args);
};
```

```tsx
// App.tsx — first line
import "./suppress-logs";
```

---

## Development Build Requirement

Neither Face ID nor Apple Pay works in Expo Go. Always test via a dev build:

```bash
npx expo run:ios
```

After adding packages or config plugins:
```bash
npx expo prebuild --clean
npx expo run:ios
```

---

## Checklist Before Shipping

- [ ] `NSFaceIDUsageDescription` present in `app.json` → `ios.infoPlist`
- [ ] `@stripe/stripe-react-native` plugin configured in `app.json` with correct `merchantIdentifier`
- [ ] `npx expo prebuild --clean` run after plugin was added (verify entitlements file is not empty)
- [ ] Merchant ID registered in Apple Developer Portal
- [ ] Merchant ID configured in Stripe Dashboard
- [ ] Stripe publishable key stored in `.env` (`EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`), not hardcoded
- [ ] `suppress-logs.ts` imported as first import in `App.tsx`
- [ ] Tested on a physical device via `npx expo run:ios` (Face ID and Apple Pay do not work in Simulator for full flow)
