import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, Plus, Sparkles } from 'lucide-react';
import { predefinedWordLists, WordList } from '../data/wordLists';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

export function Home() {
  const navigate = useNavigate();
  const { setSelectedWordList } = useGame();
  const [customListName, setCustomListName] = useState('');
  const [customWords, setCustomWords] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelectWordList = (wordList: WordList) => {
    setSelectedWordList(wordList);
    navigate('/game-options');
  };

  const handleCreateCustomList = () => {
    const words = customWords
      .split(',')
      .map(word => word.trim())
      .filter(word => word.length > 0);

    if (customListName && words.length > 0) {
      const customList: WordList = {
        id: 'custom',
        name: customListName,
        words,
        difficulty: 'medium'
      };
      setSelectedWordList(customList);
      setIsDialogOpen(false);
      navigate('/game-options');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-purple-600" />
            <h1 className="text-5xl font-bold text-purple-800">Spelling Adventure</h1>
            <Sparkles className="w-12 h-12 text-purple-600" />
          </div>
          <p className="text-xl text-purple-600">Choose a word list to start your spelling journey!</p>
        </div>

        {/* Create Custom List Button */}
        <div className="flex justify-center mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create Your Own Word List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom Word List</DialogTitle>
                <DialogDescription>
                  Enter a name for your list and add words separated by commas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="list-name">List Name</Label>
                  <Input
                    id="list-name"
                    placeholder="My Spelling Words"
                    value={customListName}
                    onChange={(e) => setCustomListName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="words">Words (separated by commas)</Label>
                  <Input
                    id="words"
                    placeholder="cat, dog, bird, fish"
                    value={customWords}
                    onChange={(e) => setCustomWords(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateCustomList} className="w-full">
                  Create and Start
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Word Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {predefinedWordLists.map((wordList) => (
            <Card
              key={wordList.id}
              className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-purple-400"
              onClick={() => handleSelectWordList(wordList)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                    <CardTitle>{wordList.name}</CardTitle>
                  </div>
                  <Badge className={getDifficultyColor(wordList.difficulty)}>
                    {wordList.difficulty}
                  </Badge>
                </div>
                <CardDescription>
                  {wordList.words.length} words
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {wordList.words.slice(0, 6).map((word, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm"
                    >
                      {word}
                    </span>
                  ))}
                  {wordList.words.length > 6 && (
                    <span className="px-2 py-1 text-purple-600 text-sm">
                      +{wordList.words.length - 6} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
