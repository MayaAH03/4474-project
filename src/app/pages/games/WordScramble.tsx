import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, XCircle, Trophy, RefreshCw } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { Card, CardContent } from '../../components/ui/card';
import "../Home.css";

export function WordScramble() {
  const navigate = useNavigate();
  const { selectedWordList } = useGame();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [scrambledWord, setScrambledWord] = useState('');

  if (!selectedWordList) {
    navigate('/');
    return null;
  }
  //selectedWordList.words.sort(() => Math.random() - 0.5); // shuffle words each time game starts
  const currentWord = selectedWordList.words[currentWordIndex];
  const progress = ((currentWordIndex + 1) / selectedWordList.words.length) * 100;

  const scrambleWord = (word: string) => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    const scrambled = letters.join('');
    // Make sure it's actually scrambled
    return scrambled === word ? scrambleWord(word) : scrambled;
  };

  useEffect(() => {
    setScrambledWord(scrambleWord(currentWord));
  }, [currentWordIndex, currentWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = userAnswer.toLowerCase() === currentWord.toLowerCase();
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

  const handleReshuffle = () => {
    setScrambledWord(scrambleWord(currentWord));
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
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Awesome Work!</h2>
            <p className="text-xl mb-2">You scored</p>
            <p className="text-5xl font-bold text-purple-600 mb-4">
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
    <div className="min-h-screen pt-[8vh]">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-0">
          <Button
            variant="ghost"
            onClick={() => navigate('/game-options')}
            className="gap-2 mb-2 hover:shadow-xl transition-all cursor-pointer border-2 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-purple-800">Word Scramble | Category: {selectedWordList.name}</h1>
            <div className="text-2xl font-bold text-purple-600">Score: {score}/{selectedWordList.words.length}</div>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-center mt-2 text-purple-700">
            Word {currentWordIndex + 1} of {selectedWordList.words.length}
          </p>
        </div>

        {/* Game Card */}
        <Card className="p-8 border-0 bg-">
          <CardContent>
            <div className="text-center mb-4">
              {!showFeedback && <p className="text-xl mb-6">Unscramble the letters:</p>}
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="bg-gradient-to-br from-blue-400 to-purple-400 text-white px-8 py-6 rounded-2xl">
                  <p className="text-5xl font-bold tracking-widest">{scrambledWord}</p>
                </div>
              </div>
              {!showFeedback && (<Button
                onClick={handleReshuffle}
                variant="outline"
                className="hover:shadow-xl transition-all cursor-pointer border-2 hover:scale-105"
                size="sm"
              >
                <RefreshCw className="w-4 h-2" />
                Reshuffle
              </Button>)}
            </div>

            <form onSubmit={handleSubmit} className="space-y-1">
              <div>
                <Input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="text-2xl text-center h-8"
                  disabled={showFeedback}
                  autoFocus
                />
              </div>

              {showFeedback && (
                <div className={`p-3 rounded-lg text-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-800">Correct!</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-800">Not quite!</p>
                      <p className="text-xl text-red-700 mt-2">The correct word is: <span className="font-bold">{currentWord}</span></p>
                    </>
                  )}
                </div>
              )}

              {!showFeedback && (
                <Button type="submit" size="lg" className="w-full hover:shadow-xl transition-all cursor-pointer border-2 hover:scale-105">
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
