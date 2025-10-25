import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";

// if (!__DEV__) {
//   console.log = () => {};
//   console.warn = () => {};
//   console.error = () => {};
// }

// https://docs.expo.dev/router/reference/troubleshooting/#expo_router_app_root-not-defined

export function App() {
  const ctx = require.context("./app");
  return <ExpoRoot context={ctx} />;
}
registerRootComponent(App);
