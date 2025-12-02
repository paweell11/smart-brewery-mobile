import { useAuthContext } from "@/hooks/useAuthContext";
import { useRouter } from "expo-router";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Surface, Text, useTheme } from "react-native-paper";

export default function AccountActionsCard() {
  const theme = useTheme();
  const router = useRouter();
  const { logOut } = useAuthContext();

  const ROWS = [
    {
      key: "profile" as const,
      label: "Mój profil",
      icon: "account-outline",
      onPress: () => router.push("/settings/myprofile"),
      tone: "normal" as const,
      showChevron: true,
    },
    {
      key: "about" as const,
      label: "O aplikacji",
      icon: "information-outline",
      onPress: () => router.push("/settings/about"),
      tone: "normal" as const,
      showChevron: true,
    },
    {
      key: "logout" as const,
      label: "Wyloguj",
      icon: "logout",
      onPress: () => {
        console.log("Wyloguj kliknięty");
        logOut();
      },
      tone: "destructive" as const,
      showChevron: false,
    },
  ];

  return (
    <View style={styles.wrapper}>
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
        {ROWS.map((row, idx) => {
          const isLast = idx === ROWS.length - 1;
          const color =
            row.tone === "destructive"
              ? theme.colors.error
              : theme.colors.onSurface;

          return (
            <View
              key={row.key}
              style={[
                styles.row,
                !isLast && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.outlineVariant,
                },
              ]}
              onTouchEnd={row.onPress}
            >
              <View style={styles.leftSide}>
                <View style={styles.leftIconWrap}>
                  <Icon
                    source={row.icon}
                    size={22}
                    color={color}
                  />
                </View>

                <Text
                  variant="titleMedium"
                  style={{ color }}
                >
                  {row.label}
                </Text>
              </View>

              {row.showChevron ? (
                <Icon
                  source="chevron-right"
                  size={22}
                  color={theme.colors.onSurface}
                />
              ) : (
                <View style={{ width: 22, height: 22 }} />
              )}
            </View>
          );
        })}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 32,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: "space-between",
  },
  leftSide: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftIconWrap: {
    marginRight: 12,
  },
});
