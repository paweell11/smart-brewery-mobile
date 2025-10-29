import { createContext, ReactNode, useEffect, useRef, useState } from "react";


type ConnectionStatesType = {
  isOpen: boolean;
  isClosed: boolean;
  isConnecting: boolean;
}


export const WebSocketContext = createContext<
  {
    ws: WebSocket | null;
    connectionStates: ConnectionStatesType;
    connect: () => void;
  } | null
>(null);

export function WebSocketProvider ({ children, wssUrl, setKey }: { children: ReactNode, wssUrl: string, setKey: React.Dispatch<React.SetStateAction<number>> }) {
  const [connectionStates, setConnectionStates] = useState<ConnectionStatesType>({
    isOpen: false,
    isClosed: false,
    isConnecting: true,
  });
  const wsRef = useRef<WebSocket | null>(null);
  
  console.log(connectionStates)

  useEffect(() => {
    const ws = new WebSocket(wssUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connection with ${wssUrl} is open.`);
      setConnectionStates({ isOpen: true, isClosed: false, isConnecting: false });
    }

    ws.onclose = () => {
      console.log(`WebSocket connection with ${wssUrl} is closed.`);
      setConnectionStates({ isOpen: false, isClosed: true, isConnecting: false });
    }

  }, [])

  return (
    <WebSocketContext.Provider 
      value={{
        ws: wsRef.current,
        connectionStates, 
        connect: () => {
          setKey((prev) => prev + 1);
        } 
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );

}

