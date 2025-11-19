import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import InsideTemperatureDetails from "./sensor-details/InsideTemperatureDetails";
import PhDetails from "./sensor-details/PhDetails";
import TemperatureDetails from "./sensor-details/TemperatureDetails";

type Props = {
  type: "temp" | "ph" | "insideTemp" | "weight" | "humidity" | "pressure";
};

export default function SensorDetailsModal({ type }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: theme.colors.background }]}>
      {type === "temp" && <TemperatureDetails />}
      {type === "ph" && <PhDetails />}
      {type === "insideTemp" && <InsideTemperatureDetails />}
      {/* {type === "weight" && <WeightDetails />} itd. */}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 16,
    padding: 16,
    paddingRight: 56,
    paddingTop: 20, 
    minHeight: "60%",
  },
});
