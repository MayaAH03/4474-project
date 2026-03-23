import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { Card, CardContent } from '../../components/ui/card';
import "../Home.css";

export function MissingLetters() {
  const navigate = useNavigate();
  const { selectedWordList } = useGame();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);

  if (!selectedWordList) {
    navigate('/');
    return null;
  }
  selectedWordList.words.sort(() => Math.random() - 0.5); // shuffle words each time game starts
  const currentWord = selectedWordList.words[currentWordIndex];
  const progress = ((currentWordIndex + 1) / selectedWordList.words.length) * 100;

  const getRandomIndices = (word: string) => {
    const numToHide = Math.min(Math.max(2, Math.floor(word.length / 2)), word.length - 1);
    const indices: number[] = [];
    while (indices.length < numToHide) {
      const randomIndex = Math.floor(Math.random() * word.length);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    return indices.sort((a, b) => a - b);
  };

  useEffect(() => {
    setHiddenIndices(getRandomIndices(currentWord));
  }, [currentWordIndex, currentWord]);

  const getDisplayWord = () => {
    return currentWord
      .split('')
      .map((letter, index) => (hiddenIndices.includes(index) ? '_' : letter))
      .join(' ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const correct =
      userAnswer.trim().toLowerCase() === currentWord.trim().toLowerCase();

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentWordIndex < selectedWordList.words.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
        setUserAnswer('');
        setShowFeedback(false);
      } else {
        setGameComplete(true);
      }
    }, 2000);
  };

  const restartGame = () => {
    setCurrentWordIndex(0);
    setUserAnswer('');
    setScore(0);
    setShowFeedback(false);
    setGameComplete(false);
  };

  if (gameComplete) {
    const percentage = Math.round((score / selectedWordList.words.length) * 100);
    return (
      <div className="max-w-screen min-h-screen flex items-center justify-center">
        <Card className="max-w-4xl w-full">
          <CardContent className="pt-6 text-center">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Fantastic!</h2>
            <p className="text-xl mb-2">You scored</p>
            <p className="text-5xl font-bold text-teal-600 mb-4">
              {score}/{selectedWordList.words.length}
            </p>
            <p className="text-2xl mb-6">{percentage}%</p>
            <div className="space-y-3">
              <Button onClick={restartGame} className="w-full" size="lg">
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
    <div>
      <div className="max-w-6xl mx-auto pt-[8vh]">
        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/game-options')}
            className="gap-2 mb-4 hover:shadow-xl transition-all cursor-pointer border-2 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-3xl font-bold text-teal-800">Missing Letters | Category: {selectedWordList.name}</h1>
            <div className="text-2xl font-bold text-teal-600">
              Score: {score}/{selectedWordList.words.length}
            </div>
          </div>

          <Progress value={progress} className="h-3" />
          <p className="text-center mt-2 text-teal-700">
            Word {currentWordIndex + 1} of {selectedWordList.words.length}
          </p>
        </div>

        <Card className="p-8 border-0 bg-">
          <CardContent>
            <div className="text-center mb-4">
              {!showFeedback && <p className="text-xl mb-3">Type the full word:</p>}

              <div className="bg-gradient-to-br from-green-400 to-teal-400 text-white px-6 py-8 rounded-2xl mb-6 overflow-x-auto">
                <p className="text-3xl md:text-4xl font-bold font-mono whitespace-nowrap text-center">
                  {getDisplayWord()}
                </p>
              </div>

              {!showFeedback && <p className="text-gray-600">Look at the missing letters and type the complete word</p>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type the full word..."
                  className="text-2xl text-center h-7"
                  autoFocus
                />
              </div>

              {showFeedback && (
                <div className={`p-3 rounded-lg text-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-800">Correct!</p>
                      <p className="text-xl text-green-700 mt-2">
                        The word is: <span className="font-bold">{currentWord}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-16 h-16 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-800">Not quite!</p>
                      <p className="text-xl text-red-700 mt-2">
                        The complete word is: <span className="font-bold">{currentWord}</span>
                      </p>
                    </>
                  )}
                </div>
              )}

              {!showFeedback && (
                <div className="flex justify-center mt-4">
                  <Button type="submit" size="sm" className="w-full px-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:scale-105">
                    Submit Answer
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
