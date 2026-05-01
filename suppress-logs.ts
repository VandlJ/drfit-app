// Must be the FIRST import in app/_layout.tsx — patches console.error before any library loads.
// React 19 added a strict forwardRef check that fires at module-load time.
// react-native-paper and @stripe/stripe-react-native use single-param forwardRef (React 18 style).
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
