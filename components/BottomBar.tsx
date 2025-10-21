// components/BottomBar.tsx
import { Href, usePathname, useRouter } from "expo-router";
import * as React from "react";
import { StyleSheet } from "react-native";
import { BottomNavigation } from "react-native-paper";

type Tab = {
  key: string;
  title: string;
  // Paper używa focusedIcon/unfocusedIcon (nie "icon")
  focusedIcon: string;
  unfocusedIcon?: string;
  href: Href;
};

const TABS: Tab[] = [
  { key: "home", title: "Home", focusedIcon: "home-outline", href: "/" as Href},
  { key: "more", title: "More", focusedIcon: "dots-horizontal", href: "/more" as Href},
];

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const index = Math.max(0, TABS.findIndex(t => t.href === pathname));

  return (
    <BottomNavigation.Bar
      navigationState={{ index, routes: TABS }}
      getLabelText={({ route }: { route: Tab }) => route.title}
      onTabPress={({ route }: { route: Tab }) => {
        if (route.href !== pathname) {
          router.replace(route.href);
        }
      }}
      style={styles.bar}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 8,
    zIndex: 10,
  },
});
