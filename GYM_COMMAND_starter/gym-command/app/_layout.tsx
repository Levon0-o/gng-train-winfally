import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getProfile } from '../src/lib/profile';
import { setAccentTheme } from '../src/components/UI';

export default function RootLayout() {
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    getProfile().then((profile) => {
      setAccentTheme(profile.accentTheme);
      setThemeReady(true);
    }).catch(() => setThemeReady(true));
  }, []);

  if (!themeReady) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#101214' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="log" options={{ presentation: 'modal' }} />
        <Stack.Screen name="rest" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
