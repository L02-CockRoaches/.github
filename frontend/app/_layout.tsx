import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { startSession, trackError, trackPerformance } from '@/services/analytics';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_900Black,
  Montserrat_400Regular_Italic,
} from '@expo-google-fonts/montserrat';

const appStartedAt = Date.now();

// Prevent the native splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Prevent errors in environments where splash screen isn't supported */
});

export default function RootLayout() {
  const reportedStartup = useRef(false);
  const [loaded, error] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_900Black,
    Montserrat_400Regular_Italic,
  });

  useEffect(() => {
    if (loaded || error) {
      const bootstrapDurationMs = Date.now() - appStartedAt;
      SplashScreen.hideAsync().catch(() => {
        /* Prevent errors in environments where splash screen isn't supported */
      });

      if (!reportedStartup.current) {
        reportedStartup.current = true;
        void startSession({ bootstrapDurationMs, fontsLoaded: loaded });
        void trackPerformance('app_bootstrap', bootstrapDurationMs, { fontsLoaded: loaded });
        if (error) {
          void trackError(error, { area: 'font_loading' });
        }
      }
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

