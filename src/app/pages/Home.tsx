import { useState } from 'react';
import { useNavigate } from 'react-router';
import {Apple, BookOpen, PaletteIcon, Plus, Shrub, Squirrel, Trophy} from 'lucide-react';
import { predefinedWordLists, WordList } from '../data/wordLists';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import "./Home.css";

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
      predefinedWordLists.push(customList);
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

  const getIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Animals':
        return <Squirrel className="w-6 h-6 text-purple-600" />
      case 'Colours':
        return <PaletteIcon className="w-6 h-6 text-purple-600" />
      case 'Food':
        return <Apple className="w-6 h-6 text-purple-600" />
      case 'Nature':
        return <Shrub className="w-6 h-6 text-purple-600" />
      case 'School Words':
        return <BookOpen className="w-6 h-6 text-purple-600" />
      case 'Challenge Words':
        return <Trophy className="w-6 h-6 text-purple-600" />
      default:
        return <BookOpen className="w-6 h-6 text-purple-600" />
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen pt-[8vh]">
      <div className="max-w-6xl mx-auto w-full px-4">
        {/* Header */}
        <div className="text-center m-4 mb-5">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-5xl font-bold text-purple-800 mt-3 px-6 py-3">Spelling Central</h1>
          </div>
          <p className="text-xl text-purple-600">Choose a word list to start your spelling journey!</p>
        </div>

        {/* Create Custom List Button */}
        <div className="flex justify-center mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 hover:shadow-xl hover:shadow-xl transition-all cursor-pointer border-2 hover:scale-105">
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
                  <textarea
                    id="words"
                    placeholder="cat, dog, bird, fish"
                    value={customWords}
                    draggable
                    className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm
                      focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px],
                      aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                    cols={60}
                    onChange={(e) => setCustomWords(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateCustomList} className="w-full hover:shadow-xl transition-all cursor-pointer border-2 hover:scale-105">
                  Create and Start
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Word Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[1fr] gap-5">
          {predefinedWordLists.map((wordList) => (
            <Card
              key={wordList.id}
              className="w-full h-full hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-purple-400 hover:scale-105"
              onClick={() => handleSelectWordList(wordList)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(wordList.name)}
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
                <div className="flex flex-wrap gap-1">
                  {wordList.words.slice(0, 3).map((word, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm"
                    >
                      {word}
                    </span>
                  ))}
                  {wordList.words.length > 3 && (
                    <span className="px-2 py-1 text-purple-600 text-sm">
                      +{wordList.words.length - 3} more
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
