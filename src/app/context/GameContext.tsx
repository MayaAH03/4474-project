import React, { createContext, useContext, useState } from 'react';
import { WordList } from '../data/wordLists';

interface GameContextType {
  selectedWordList: WordList | null;
  setSelectedWordList: (wordList: WordList | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [selectedWordList, setSelectedWordList] = useState<WordList | null>(null);

  return (
    <GameContext.Provider value={{ selectedWordList, setSelectedWordList }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
