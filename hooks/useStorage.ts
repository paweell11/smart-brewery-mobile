import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useReducer } from "react";
import { Platform } from "react-native";


function setStorageItem(key: string, value: string | null) {
  if (Platform.OS === "web") {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error("Local storage error:", error);
    }
  
  } else {
    if (value === null) {
      SecureStore.deleteItemAsync(key).catch((error) => console.error("Secure store - item deleting error:", error));
    } else {
      SecureStore.setItemAsync(key, value).catch((error) => console.error("Secure store - item setting error:", error));
    }
  }
}


function reducer(state: { isLoading: boolean, value: string | null }, action: string | null) {
  return (
    { isLoading: false, value: action }
  );
}

export function useStorage(key: string) {
  const [state, setValue] = useReducer(
    reducer,
    { isLoading: true, value: null }
  );

  useEffect(() => {
    if (Platform.OS === "web") {
      try {
        if (typeof localStorage !== "undefined") {
          const value = localStorage.getItem(key);
          setValue(value);
        }
      } catch (error) {
        console.error("Local storage error:", error);
      }
    
    } else {
      SecureStore.getItemAsync(key).then((value) => {
        setValue(value);
      });
    }
  }, [key]);


  const setStorageValue = useCallback((value: string | null) => {
    setValue(value);
    setStorageItem(key, value);
  }, [key])


  return { storageState: state, setStorageValue };

}