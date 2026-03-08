import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SettingsContext, useSettingsProvider } from "@/hooks/useSettings";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Geri" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const settingsValue = useSettingsProvider();

  useEffect(() => {
    if ((fontsLoaded || fontError) && settingsValue.isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, settingsValue.isLoaded]);

  if (!fontsLoaded && !fontError) return null;
  if (!settingsValue.isLoaded) return null;

  return (
    <ErrorBoundary>
      <SettingsContext.Provider value={settingsValue}>
        <GestureHandlerRootView>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </SettingsContext.Provider>
    </ErrorBoundary>
  );
}
