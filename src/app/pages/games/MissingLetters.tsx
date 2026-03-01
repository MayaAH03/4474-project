import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { Card, CardContent } from '../../components/ui/card';

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
    return currentWord.split('').map((letter, index) => {
      if (hiddenIndices.includes(index)) {
        return '_';
      }
      return letter;
    }).join(' ');
  };

  const getMissingLetters = () => {
    return hiddenIndices.map(index => currentWord[index]).join('').toLowerCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = userAnswer.toLowerCase() === getMissingLetters();
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentWordIndex < selectedWordList.words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
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
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
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
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 p-8">
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
            <h1 className="text-3xl font-bold text-teal-800">Missing Letters</h1>
            <div className="text-2xl font-bold text-teal-600">Score: {score}/{selectedWordList.words.length}</div>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-center mt-2 text-teal-700">
            Word {currentWordIndex + 1} of {selectedWordList.words.length}
          </p>
        </div>

        {/* Game Card */}
        <Card className="p-8">
          <CardContent>
            <div className="text-center mb-8">
              <p className="text-xl mb-6">Fill in the missing letters:</p>
              <div className="bg-gradient-to-br from-green-400 to-teal-400 text-white px-8 py-8 rounded-2xl mb-6">
                <p className="text-5xl font-bold tracking-widest font-mono">{getDisplayWord()}</p>
              </div>
              <p className="text-gray-600">Type only the missing letters in order</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type missing letters..."
                  className="text-2xl text-center h-16"
                  disabled={showFeedback}
                  autoFocus
                />
              </div>

              {showFeedback && (
                <div className={`p-6 rounded-lg text-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-800">Correct!</p>
                      <p className="text-xl text-green-700 mt-2">The word is: <span className="font-bold">{currentWord}</span></p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-16 h-16 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-800">Not quite!</p>
                      <p className="text-xl text-red-700 mt-2">The complete word is: <span className="font-bold">{currentWord}</span></p>
                    </>
                  )}
                </div>
              )}

              {!showFeedback && (
                <Button type="submit" size="lg" className="w-full">
                  Submit Answer
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
