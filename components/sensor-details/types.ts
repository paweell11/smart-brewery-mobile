export type PhDataType = {
  "id": number;
  "device_id": string;
  "ph_value": number;
  "timestamp": string;
}

export type TempDataType = {
  "id": number;
  "device_id": string;
  "temperature_celsius": number;
  "timestamp": string;
}

export type WeightDataType = {
  "id": number;
  "device_id": string;
  "weight_kg": number;
  "timestamp": string;
}

export type HumidityDataType = {
  "id": number;
  "device_id": string;
  "humidity_percent": number;
  "timestamp": string;
}

export type PressureDataType = {
  "id": number;
  "device_id": string;
  "pressure_hpa": number;
  "timestamp": string;
}