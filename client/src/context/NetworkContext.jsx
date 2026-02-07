import React, { createContext, useEffect, useState } from "react";
import { subscribeToNetwork } from "../services/network/networkListener";

export const NetworkContext = createContext({ online: true });

export function NetworkProvider({ children }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const unsubscribe = subscribeToNetwork(setOnline);
    return unsubscribe;
  }, []);

  return (
    <NetworkContext.Provider value={{ online }}>
      {children}
    </NetworkContext.Provider>
  );
}
