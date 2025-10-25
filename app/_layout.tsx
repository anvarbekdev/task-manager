import '~/global.css';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Alert, Platform } from 'react-native';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { SessionProvider, useSession } from '~/context/AuthContext';
import { QueryClient, QueryClientProvider } from "react-query";
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NAV_THEME } from '~/lib/theme';
import { useColorScheme, colorScheme as nativeColorScheme } from 'nativewind';
import { THEME_STORAGE_KEY } from '~/constants';
import { View } from '@rn-primitives/slot';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

export {
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const queryClient = new QueryClient();
  const router = useRouter()
  const { signOut } = useSession()

  React.useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (Platform.OS === 'web') {
        document.documentElement.classList.add('bg-background');
      }
      if (!theme) {
        AsyncStorage.setItem('theme', colorScheme === 'dark' ? 'dark' : 'light');
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light';
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);
        setAndroidNavigationBar(colorTheme);
        setColorScheme(colorTheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      setAndroidNavigationBar(colorTheme);
      setIsColorSchemeLoaded(true);
    })();
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => { } },
      {
        text: "Logout",
        onPress: () => {
          signOut()
          setTimeout(() => {
            router.push("/sign-in")
          }, 50)
        },
      },
    ])
  }

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'light' ? NAV_THEME.light : NAV_THEME.dark || NAV_THEME.light}>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar />
            <Stack
              screenOptions={{
                contentStyle: {
                  paddingTop: 40,
                  paddingHorizontal: 10,
                }
              }}
              initialRouteName="index"

            >
              <Stack.Screen
                name='sign-in'
                options={{
                  headerShown: false,
                }}
                />
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
            <PortalHost />
          </QueryClientProvider>
        </SessionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
