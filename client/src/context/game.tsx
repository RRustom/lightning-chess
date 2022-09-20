import React, { createContext, useContext, useState, useMemo } from 'react';

export type GameContextType = {
  uuid: string | null;
};

const GameContextDefaults = {
  uuid: null,
};

export const GameContext = createContext<GameContextType>(GameContextDefaults);

export const GameProvider = ({ children }: any) => {
  const [uuid, setUuid] = useState<string | null>(null);

  const memoedValue = useMemo(() => ({ uuid, setUuid }), [uuid, setUuid]);

  return (
    <GameContext.Provider value={memoedValue}>{children}</GameContext.Provider>
  );
};

export default function useGame() {
  return useContext(GameContext);
}
