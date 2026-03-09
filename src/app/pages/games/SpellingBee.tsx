import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Volume2, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { Card, CardContent } from '../../components/ui/card';
import "../Home.css";

export function SpellingBee() {
  const navigate = useNavigate();
  const { selectedWordList } = useGame();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  if (!selectedWordList) {
    navigate('/');
    return null;
  }

  const currentWord = selectedWordList.words[currentWordIndex];
  const progress = ((currentWordIndex + 1) / selectedWordList.words.length) * 100;

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Speak the word when it changes
    speakWord();
  }, [currentWordIndex]);

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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Great Job!</h2>
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
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/game-options')}
            className="gap-2 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-orange-800">Spelling Bee</h1>
            <div className="text-2xl font-bold text-orange-600">Score: {score}/{selectedWordList.words.length}</div>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-center mt-2 text-orange-700">
            Word {currentWordIndex + 1} of {selectedWordList.words.length}
          </p>
        </div>

        {/* Game Card */}
        <Card className="p-4 border-0 bg-">
          <CardContent>
            <div className="text-center mb-4">
              {!showFeedback && <p className="text-xl mb-3">Listen and spell the word:</p>}
              <Button
                onClick={speakWord}
                size="lg"
                className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500"
              >
                <Volume2 className="w-10 h-10" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                      <p className="text-xl text-red-700 mt-2">The correct spelling is: <span className="font-bold">{currentWord}</span></p>
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
