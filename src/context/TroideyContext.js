import { createContext, useState, useCallback } from 'react';

export const TroideyContext = createContext({
  muted: false,
  toggleMute: () => {},
});

export const TroideyProvider = ({ children }) => {
  const [muted, setMuted] = useState(false);
  const toggleMute = useCallback(() => setMuted((prev) => !prev), []);

  return (
    <TroideyContext.Provider value={{ muted, toggleMute }}>
      {children}
    </TroideyContext.Provider>
  );
};
