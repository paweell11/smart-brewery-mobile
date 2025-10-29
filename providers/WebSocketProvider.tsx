import { createContext, ReactNode, useEffect, useRef, useState } from "react";


type ConnectionStatesType = {
  isOpen: boolean;
  isClosed: boolean;
}


export const WebSocketContext = createContext<
  {
    ws: WebSocket | null;
    connectionStates: ConnectionStatesType;
  } | null
>(null);

export function WebSocketProvider ({ children, wssUrl }: { children: ReactNode, wssUrl: string }) {
  const [connectionStates, setConnectionStates] = useState<ConnectionStatesType>({
    isOpen: false,
    isClosed: false,
  });
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const ws = new WebSocket(wssUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connection with ${wssUrl} is open.`);
      setConnectionStates({ isOpen: true, isClosed: false });
    }

    ws.onclose = () => {
      console.log(`WebSocket connection with ${wssUrl} is closed.`);
      setConnectionStates({ isOpen: false, isClosed: true });
    }

  }, [])

  return (
    <WebSocketContext.Provider value={{ ws: wsRef.current, connectionStates }}>
      {children}
    </WebSocketContext.Provider>

  );

}

