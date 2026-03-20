import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Trophy, GripVertical, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

function shuffle<T>(arr: T[]): T[] {
  let currentIndex = arr.length,  randomIndex;

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [arr[currentIndex], arr[randomIndex]] = [
        arr[randomIndex], arr[currentIndex]];
    }
    
  return [...arr];
}

export function Alphabetical() {
  const navigate = useNavigate();
  const { selectedWordList } = useGame();

  const [words, setWords] = useState<string[]>([]);
  const [correctOrder, setCorrectOrder] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [grabOffset, setGrabOffset] = useState({ x: 0, y: 0 });
  const [dragWidth, setDragWidth] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const itemHeightRef = useRef(52);
  const wordsRef = useRef(words);
  const dragIdxRef = useRef(dragIdx);
  const hoverIdxRef = useRef(hoverIdx);
  wordsRef.current = words;
  dragIdxRef.current = dragIdx;
  hoverIdxRef.current = hoverIdx;

  if (!selectedWordList) {
    navigate('/');
    return null;
  }

  // Initialize word order
  useEffect(() => {
    let shuffledArr = shuffle([...selectedWordList.words]);
    shuffledArr = shuffledArr.slice(0,10);
    setCorrectOrder([...shuffledArr].sort());

    while (JSON.stringify(correctOrder) === JSON.stringify(shuffledArr)) {
      shuffledArr = shuffle([...shuffledArr]);
    }

    setWords([...shuffledArr]);
  }, [selectedWordList]);

  useEffect(() => {
    if (listRef.current && listRef.current.children.length > 1) {
      const first = listRef.current.children[0] as HTMLElement;
      const second = listRef.current.children[1] as HTMLElement;
      const gap = second.getBoundingClientRect().top - first.getBoundingClientRect().bottom;
      itemHeightRef.current = first.offsetHeight + gap;
    }
  }, [words.length]);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    if (checked) return;
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    setGrabOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragPos({ x: e.clientX, y: e.clientY });
    setDragIdx(idx);
    setHoverIdx(idx);
    setDragWidth(rect.width);
  };

  useEffect(() => {
    if (dragIdx === null) return;

    const onMove = (e: PointerEvent) => {
      e.preventDefault();
      setDragPos({ x: e.clientX, y: e.clientY });

      if (!listRef.current) return;
      const rect = listRef.current.getBoundingClientRect();
      const relY = e.clientY - rect.top;
      // clamp target index to valid range (error prevention)
      let target = Math.floor(relY / itemHeightRef.current);
      target = Math.max(0, Math.min(wordsRef.current.length - 1, target));

      if (target !== hoverIdxRef.current) {
        setHoverIdx(target);
      }
    };

    const onUp = () => {
      const d = dragIdxRef.current;
      const h = hoverIdxRef.current;

      if (d !== null && h !== null && d !== h) {
        // reorder the array to match the visual position
        setWords(prev => {
          const next = [...prev];
          const [item] = next.splice(d, 1);
          next.splice(h, 0, item);
          return next;
        });
      }

      setDragIdx(null);
      setHoverIdx(null);
    };

    // prevent text selection while dragging
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragIdx]);

  const getShift = (idx: number) => {
    if (dragIdx === null || hoverIdx === null || idx === dragIdx) return 0;
    const h = itemHeightRef.current;
    if (dragIdx < hoverIdx && idx > dragIdx && idx <= hoverIdx) return -h;
    if (dragIdx > hoverIdx && idx >= hoverIdx && idx < dragIdx) return h;
    return 0;
  };

  const handleCheck = () => {
    let score = 0;
    for (let i = 0; i < correctOrder.length; i++) {
      if(correctOrder[i] == words[i]) {
        score++;
      }
    }

    setScore(score);
    setChecked(true);
  };

  const handleRestart = () => {
    let shuffledArr = shuffle([...selectedWordList.words]);
    shuffledArr = shuffledArr.slice(0,10);
    setCorrectOrder([...shuffledArr].sort());

    while (JSON.stringify(correctOrder) === JSON.stringify(shuffledArr)) {
      shuffledArr = shuffle([...shuffledArr]);
    }

    setWords([...shuffledArr]);
    setChecked(false);
    setScore(0);
    setGameComplete(false);
  };

  // Completion screen

  if (gameComplete) {
    const pct = Math.round((score / words.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100 p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Great Job!</h2>
            <p className="text-xl mb-2">You scored</p>
            <p className="text-5xl font-bold text-orange-600 mb-4">
              {score}/{words.length}
            </p>
            <p className="text-2xl mb-2">{pct}%</p>
            <p className="text-lg text-gray-600 mb-6">words in the correct position</p>
            <div className="space-y-3">
              <Button onClick={handleRestart} className="w-full" size="lg">
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

  // Main game screen

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100 pt-[8vh]">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/game-options')}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-red-800">Alphabetical</h1>
          </div>

          <p className="text-center text-lg text-orange-700">
            Word List: <span className="font-semibold">{selectedWordList.name}</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-xl text-gray-700">
            {checked
              ? 'Here\'s how you did:'
              : 'Drag and drop the words into alphabetical order!'}
          </p>
        </div>

        {/* Sortable word list */}
        <Card className="p-6">
          <CardContent>
            <div
              ref={listRef}
              className="flex flex-col gap-2"
              style={{ touchAction: dragIdx !== null ? 'none' : 'auto' }}
            >
              {words.map((word, idx) => {
                const isDragged = dragIdx === idx;
                const shift = getShift(idx);
                const isCorrect = checked && correctOrder[idx] != null
                  && word.toLowerCase() === correctOrder[idx].toLowerCase();
                const isWrong = checked && !isCorrect;

                return (
                  <div
                    key={word}
                    onPointerDown={e => handlePointerDown(e, idx)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl border-2 select-none
                      ${checked
                        ? isCorrect
                          ? 'bg-green-50 border-green-400'
                          : 'bg-red-50 border-red-400'
                        : 'bg-white border-gray-200 hover:border-orange-300'
                      }
                      ${!checked ? 'cursor-grab active:cursor-grabbing' : ''}
                    `}
                    style={{
                      opacity: isDragged ? 0.3 : 1,
                      transform: shift ? `translateY(${shift}px)` : 'none',

                      transition: dragIdx !== null ? 'transform 200ms ease' : 'none',
                    }}
                  >
                    {!checked && (
                      <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    {checked && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                    {checked && isWrong && (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}

                    <span className="text-lg font-medium capitalize">{word}</span>
                  </div>
                );
              })}
            </div>

            {/* Drag overlay */}
            {dragIdx !== null && (
              <div
                className="fixed pointer-events-none z-50"
                style={{
                  left: dragPos.x - grabOffset.x,
                  top: dragPos.y - grabOffset.y,
                  width: dragWidth,
                }}
              >
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-orange-400 bg-white shadow-2xl scale-105">
                  <GripVertical className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <span className="text-lg font-medium capitalize">{words[dragIdx]}</span>
                </div>
              </div>
            )}

            {/* Correct order reference after checking */}
            {checked && (
              <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <p className="text-sm font-semibold text-orange-800 mb-2">
                  Correct alphabetical order:
                </p>
                <p className="text-sm text-orange-700">
                  {correctOrder.join(', ')}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex justify-center gap-4">
              {!checked ? (
                <>
                  <Button onClick={handleRestart} variant="outline" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reshuffle
                  </Button>
                  <Button onClick={handleCheck} size="lg" className="px-8">
                    Check Order
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-2xl font-bold text-orange-700">
                    {score}/{words.length} in the right place!
                  </p>
                  <Button onClick={() => setGameComplete(true)} size="lg">
                    See Final Score
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
