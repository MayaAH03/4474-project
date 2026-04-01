import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Trophy, RotateCcw } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Card, CardContent } from '../../components/ui/card';
import "../Home.css";

const GRID_SIZE = 12;
const DIRECTIONS = [
  [0, 1],   // right
  [1, 0],   // down
  [1, 1],   // diagonal down-right
  [-1, 1],  // diagonal up-right
];

type Cell = {
  letter: string;
  wordIndex: number | null; // which word this cell belongs to (-1 = filler)
};

type Selection = {
  start: [number, number] | null;
  end: [number, number] | null;
  cells: [number, number][];
};

type FoundWord = {
  word: string;
  cells: [number, number][];
};

function buildGrid(words: string[]): { grid: Cell[][], placements: { word: string; cells: [number, number][] }[] } {
  const grid: Cell[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ letter: '', wordIndex: null }))
  );

  const placements: { word: string; cells: [number, number][] }[] = [];

  for (let wi = 0; wi < words.length; wi++) {
    const word = words[wi].toUpperCase();
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 200) {
      attempts++;
      const dirIdx = Math.floor(Math.random() * DIRECTIONS.length);
      const [dr, dc] = DIRECTIONS[dirIdx];
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      const cells: [number, number][] = [];
      let valid = true;

      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) { valid = false; break; }
        const existing = grid[r][c].letter;
        if (existing !== '' && existing !== word[i]) { valid = false; break; }
        cells.push([r, c]);
      }

      if (valid) {
        cells.forEach(([r, c], i) => {
          grid[r][c].letter = word[i];
          grid[r][c].wordIndex = wi;
        });
        placements.push({ word: words[wi], cells });
        placed = true;
      }
    }
  }

  // Fill remaining cells with random letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].letter === '') {
        grid[r][c].letter = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return { grid, placements };
}

function getCellsBetween(start: [number, number], end: [number, number]): [number, number][] {
  const [r1, c1] = start;
  const [r2, c2] = end;
  const dr = r2 - r1;
  const dc = c2 - c1;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));

  // Only allow straight lines (horizontal, vertical, diagonal)
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return [];

  if (steps === 0) return [start];

  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  const cells: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push([r1 + stepR * i, c1 + stepC * i]);
  }
  return cells;
}

export function WordSearch() {
  const navigate = useNavigate();
  const { selectedWordList } = useGame();

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [placements, setPlacements] = useState<{ word: string; cells: [number, number][] }[]>([]);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [selection, setSelection] = useState<Selection>({ start: null, end: null, cells: [] });
  const [isSelecting, setIsSelecting] = useState(false);
  const [flashWrong, setFlashWrong] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);

  const wordsToFind = selectedWordList?.words ?? [];

  const initGame = useCallback(() => {
    if (!wordsToFind.length) return;
    wordsToFind.sort(() => Math.random() - 0.5); // shuffle words
    const limited = wordsToFind.slice(0, 10); // cap at 10 words for grid fit
    const { grid: g, placements: p } = buildGrid(limited);
    setGrid(g);
    setPlacements(p);
    setFoundWords([]);
    setSelection({ start: null, end: null, cells: [] });
    setScore(0);
    setGameComplete(false);
  }, [wordsToFind]);

  useEffect(() => { initGame(); }, [initGame]);

  if (!selectedWordList) { navigate('/'); return null; }

  const wordsInPlay = placements.map(p => p.word);
  const progress = (foundWords.length / Math.max(wordsInPlay.length, 1)) * 100;

  const cellKey = (r: number, c: number) => `${r}-${c}`;

  const isInSelection = (r: number, c: number) =>
    selection.cells.some(([sr, sc]) => sr === r && sc === c);

  const isFound = (r: number, c: number) =>
    foundWords.some(fw => fw.cells.some(([fr, fc]) => fr === r && fc === c));

  const getFoundColor = (r: number, c: number) => {
    const idx = foundWords.findIndex(fw => fw.cells.some(([fr, fc]) => fr === r && fc === c));
    const colors = [
      'bg-green-400 text-white',
    ];
    return idx >= 0 ? colors[idx % colors.length] : '';
  };

  const handleCellMouseDown = (r: number, c: number) => {
    setIsSelecting(true);
    setSelection({ start: [r, c], end: [r, c], cells: [[r, c]] });
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (!isSelecting || !selection.start) return;
    const cells = getCellsBetween(selection.start, [r, c]);
    setSelection(prev => ({ ...prev, end: [r, c], cells }));
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    if (selection.cells.length < 2) {
      setSelection({ start: null, end: null, cells: [] });
      return;
    }

    // Build selected string forward and backward
    const selectedLetters = selection.cells.map(([r, c]) => grid[r]?.[c]?.letter ?? '').join('');
    const reversed = selectedLetters.split('').reverse().join('');

    // Check against placements
    const match = placements.find(p => {
      const word = p.word.toUpperCase();
      return (word === selectedLetters || word === reversed) &&
        !foundWords.find(fw => fw.word.toUpperCase() === word);
    });

    if (match) {
      const newFound = { word: match.word, cells: selection.cells };
      const updated = [...foundWords, newFound];
      setFoundWords(updated);
      setScore(s => s + 1);
      if (updated.length === wordsInPlay.length) {
        setTimeout(() => setGameComplete(true), 600);
      }
    } else {
      setFlashWrong(true);
      setTimeout(() => setFlashWrong(false), 500);
    }

    setSelection({ start: null, end: null, cells: [] });
  };

  if (gameComplete) {
    const percentage = Math.round((score / wordsInPlay.length) * 100);
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Amazing Find!</h2>
            <p className="text-xl mb-2">You found</p>
            <p className="text-5xl font-bold text-blue-600 mb-4">
              {score}/{wordsInPlay.length}
            </p>
            <p className="text-2xl mb-6">{percentage}%</p>
            <div className="space-y-3">
              <Button onClick={initGame} className="w-full" size="lg">
                Play Again
              </Button>
              <Button onClick={() => navigate('/game-options')} variant="outline" className="w-full">
                Choose Different Game
              </Button>
              <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
                Back to Word Lists
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-150 pt-[8vh]" onMouseUp={handleMouseUp}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="w-full mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/game-options')}
            className="gap-2 mb-2 hover:shadow-xl transition-all cursor-pointer border-2 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-blue-800">Word Search | Category: {selectedWordList.name}</h1>
            <div className="text-2xl font-bold text-blue-600">
              Found: {score}/{wordsInPlay.length}
            </div>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-center mt-2 text-blue-700">
            Find all {wordsInPlay.length} words in the grid
          </p>
        </div>

        {/* Game Layout */}
        <div>
        <div className="flex flex-col lg:flex-row gap-10 items-center justify-center">
          {/* Grid */}
          <Card className="p-4 border-0 flex items-center justify-center">
            <CardContent className="p-0">
              <div
                className={`mx-auto select-none rounded-xl overflow-hidden transition-all ${flashWrong ? 'ring-4 ring-red-400' : ''}`}
                onMouseLeave={() => { if (isSelecting) handleMouseUp(); }}
              >
                {grid.map((row, r) => (
                  <div key={r} className="flex">
                    {row.map((cell, c) => {
                      const found = isFound(r, c);
                      const inSel = isInSelection(r, c);
                      return (
                        <div
                          key={cellKey(r, c)}
                          onMouseDown={() => handleCellMouseDown(r, c)}
                          onMouseEnter={() => handleCellMouseEnter(r, c)}
                          className={`
                            w-8 h-8 flex items-center justify-center
                            text-sm font-bold cursor-pointer
                            transition-all duration-100
                            border border-blue-100
                            ${found
                              ? getFoundColor(r, c)
                              : inSel
                                ? 'bg-yellow-300 text-blue-900 scale-110 z-10'
                                : 'bg-white hover:bg-blue-50 text-blue-900'
                            }
                          `}
                        >
                          {cell.letter}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Word List */}
          <Card className="p-4 border-0 lg:w-48 w-full">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-blue-800 text-lg">Words</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={initGame}
                  className="hover:shadow-xl transition-all cursor-pointer border-2 hover:scale-105"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
              <ul className="space-y-2">
                {wordsInPlay.map((word, i) => {
                  const isWordFound = foundWords.some(fw => fw.word.toLowerCase() === word.toLowerCase());
                  const foundColor = isWordFound
                    ? (['text-emerald-600', 'text-sky-600', 'text-violet-600', 'text-rose-600',
                        'text-amber-600', 'text-teal-600', 'text-pink-600', 'text-indigo-600',
                        'text-orange-600', 'text-lime-600'])[foundWords.findIndex(fw => fw.word.toLowerCase() === word.toLowerCase()) % 10]
                    : 'text-blue-700';
                  return (
                    <li
                      key={i}
                      className={`text-base font-semibold transition-all ${foundColor} ${isWordFound ? 'line-through opacity-60' : ''}`}
                    >
                      {word}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-blue-400 mt-4">
          Click and drag to select a word • Words can go Right, Diagonal, or Vertical
        </p>
      </div>
      </div>
    </div>
  );
}