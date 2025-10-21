import * as React from "react";
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Size = "sm" | "md" | "lg";
type Align = "left" | "center";

type Props = {
  title?: string;
  subtitle?: string;
  logoSource?: ImageSourcePropType; 
  onLogoPress?: () => void;
  size?: Size;           
  align?: Align;         
  padding?: number;      
  withSafeTop?: boolean; 
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  onMeasuredHeight?: (h: number) => void;
};

export default function FullWidthHeader({
  title,
  subtitle,
  logoSource,
  onLogoPress,
  size = "md",
  align = "left",
  padding = 16,
  withSafeTop = true,
  backgroundColor,
  style,
  onMeasuredHeight,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const HLogo = size === "lg" ? 60 : size === "sm" ? 28 : 34;
  const hasText = !!title || !!subtitle;
  const hasLogo = !!logoSource;
  const mode: "logoText" | "text" | "logo" =
    hasLogo && hasText ? "logoText" : hasLogo ? "logo" : "text";

  const handleLayout = (e: LayoutChangeEvent) => {
    onMeasuredHeight?.(e.nativeEvent.layout.height);
  };

  return (
    <Surface
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor ?? theme.colors.elevation.level2,
          paddingTop: (withSafeTop ? insets.top : 0) + padding,
          paddingBottom: padding,
          paddingHorizontal: padding,
        },
        style,
      ]}
      elevation={0}
      onLayout={handleLayout}
    >
      <View
        style={[
          styles.row,
          { justifyContent: align === "center" && mode !== "logoText" ? "center" : "flex-start" },
        ]}
      >
        {hasLogo ? (
          <TouchableRipple
            disabled={!onLogoPress}
            onPress={onLogoPress}
            borderless
            style={styles.logoWrap}
          >
            <Image
              source={logoSource}
              style={{ width: HLogo, height: HLogo, borderRadius: 8 }}
              resizeMode="contain"
            />
          </TouchableRipple>
        ) : null}

        {mode !== "logo" ? (
          <View
            style={[
              styles.texts,
              align === "center" ? ({ alignItems: "center" } as ViewStyle) : undefined,
              hasLogo ? { marginLeft: 12 } : undefined,
            ]}
          >
            {title ? (
              <Text variant={size === "lg" ? "headlineSmall" : size === "sm" ? "titleMedium" : "titleLarge"}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text variant="bodyMedium" style={{ opacity: 0.7, marginTop: 2 }} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoWrap: {
    borderRadius: 8,
  },
  texts: {
    flexShrink: 1,
  },
});
