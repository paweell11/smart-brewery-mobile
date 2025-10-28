// components/ThemeSelectorCard.tsx
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, RadioButton, Surface, Text, useTheme } from "react-native-paper";

type ThemeChoice = "auto" | "light" | "dark";

type Props = {
  value: ThemeChoice;                    // która opcja jest aktualnie wybrana
  onChange?: (val: ThemeChoice) => void; // kliknięcie w wiersz
};

export default function ThemeSelectorCard({ value, onChange }: Props) {
  const theme = useTheme();

  const OPTIONS: { key: ThemeChoice; label: string; icon: string }[] = [
    { key: "auto",  label: "Automatyczny", icon: "theme-light-dark" },
    { key: "light", label: "Jasny",        icon: "white-balance-sunny" },
    { key: "dark",  label: "Ciemny",       icon: "moon-waning-crescent" },
  ];

  return (
    <View style={styles.wrapper}>
      {/* <Text
        variant="labelLarge"
        style={[styles.sectionTitle, { color: theme.colors.onBackground, opacity: 0.8 }]}
      >
        Motyw
      </Text> */}

      <Surface
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.elevation.level2,
            borderColor: theme.colors.outlineVariant,
          },
        ]}
        elevation={0}
      >
        {OPTIONS.map((opt, idx) => {
          const selected = value === opt.key;
          const isLast = idx === OPTIONS.length - 1;

          return (
            <View
              key={opt.key}
              style={[
                styles.row,
                !isLast && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.outlineVariant,
                },
              ]}
              // cały wiersz klikalny
              onTouchEnd={() => {
                onChange?.(opt.key);
              }}
            >
              <View style={styles.rowLeft}>
                <View style={styles.rowIconWrap}>
                  <Icon
                    source={opt.icon}
                    size={20}
                    color={theme.colors.onSurface}
                  />
                </View>

                <Text
                  variant="bodyLarge"
                  style={{ color: theme.colors.onSurface }}
                >
                  {opt.label}
                </Text>
              </View>

              <RadioButton
                value={opt.key}
                status={selected ? "checked" : "unchecked"}
                onPress={() => onChange?.(opt.key)}
              />
            </View>
          );
        })}
      </Surface>
{/* 
      <Text
        variant="bodySmall"
        style={[
          styles.helperText,
          { color: theme.colors.onBackground, opacity: 0.6 },
        ]}
      >
        Automatyczny dopasowuje wygląd aplikacji do ustawień systemowych.
      </Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowIconWrap: {
    marginRight: 12,
  },
  helperText: {
    marginTop: 8,
    lineHeight: 16,
  },
});
