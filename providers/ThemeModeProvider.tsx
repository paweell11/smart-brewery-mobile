import { darkThemeColors } from "@/constants/darkThemeColors";
import { lightThemeColors } from "@/constants/lightThemeColors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { useColorScheme } from "react-native";
import {
    MD3DarkTheme as DarkTheme,
    MD3LightTheme as LightTheme,
} from "react-native-paper";

export type ThemeMode = "auto" | "light" | "dark";

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  theme: typeof LightTheme;
  isHydrated: boolean;
};

const STORAGE_KEY = "themeMode";

const ThemeModeContext = React.createContext<ThemeModeContextValue | null>(
  null
);

export function useThemeMode() {
  const ctx = React.useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used inside ThemeModeProvider");
  }
  return ctx;
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme(); // "light" | "dark" | null

  const [mode, _setMode] = React.useState<ThemeMode>("auto");
  const [isHydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "auto" || saved === "light" || saved === "dark") {
          _setMode(saved);
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setMode = React.useCallback(async (next: ThemeMode) => {
    _setMode(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignorujemy błąd zapisu
    }
  }, []);

  const effectiveScheme =
    mode === "auto"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : mode;

  const theme =
    effectiveScheme === "light"
      ? {
          ...LightTheme,
          roundness: 2,
          colors: lightThemeColors.colors,
        }
      : {
          ...DarkTheme,
          roundness: 2,
          colors: darkThemeColors.colors,
        };

  const ctxValue: ThemeModeContextValue = React.useMemo(
    () => ({
      mode,
      setMode,
      theme,
      isHydrated,
    }),
    [mode, setMode, theme, isHydrated]
  );

  return (
    <ThemeModeContext.Provider value={ctxValue}>
      {children}
    </ThemeModeContext.Provider>
  );
}
