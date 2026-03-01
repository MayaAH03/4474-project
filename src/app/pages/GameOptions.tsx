import { useNavigate } from 'react-router';
import { ArrowLeft, Volume2, Shuffle, ListChecks, Search } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function GameOptions() {
  const navigate = useNavigate();
  const { selectedWordList } = useGame();

  if (!selectedWordList) {
    navigate('/');
    return null;
  }

  const games = [
    {
      id: 'spelling-bee',
      name: 'Spelling Bee',
      description: 'Listen to the word and spell it correctly!',
      icon: Volume2,
      color: 'from-yellow-400 to-orange-400',
      path: '/game/spelling-bee'
    },
    {
      id: 'word-scramble',
      name: 'Word Scramble',
      description: 'Unscramble the letters to form the correct word!',
      icon: Shuffle,
      color: 'from-blue-400 to-purple-400',
      path: '/game/word-scramble'
    },
    {
      id: 'missing-letters',
      name: 'Missing Letters',
      description: 'Fill in the missing letters to complete the word!',
      icon: ListChecks,
      color: 'from-green-400 to-teal-400',
      path: '/game/missing-letters'
    },
    {
      id: 'word-search',
      name: 'Word Search',
      description: 'Find the words hidden in the grid.',
      icon: Search, 
      color: 'from-pink-400 to-purple-400',
      path: '/game/word-search'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Word Lists
          </Button>
          <h1 className="text-4xl font-bold text-purple-800 mb-2">Choose a Game</h1>
          <p className="text-xl text-purple-600">
            Word List: <span className="font-semibold">{selectedWordList.name}</span> ({selectedWordList.words.length} words)
          </p>
        </div>

        {/* Game Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Card
                key={game.id}
                className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-purple-400 hover:scale-105"
                onClick={() => navigate(game.path)}
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{game.name}</CardTitle>
                  <CardDescription className="text-base">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
