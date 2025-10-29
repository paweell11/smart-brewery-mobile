import { WebSocketContext } from "@/providers/WebSocketProvider";
import { useContext } from "react";

export function useWebSocket() {
  const contextValue = useContext(WebSocketContext);

  if (contextValue === null) {
    throw new Error("No value provided to WebSocketContext");
  }

  return contextValue;
}