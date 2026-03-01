export interface WordList {
  id: string;
  name: string;
  words: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const predefinedWordLists: WordList[] = [
  {
    id: '1',
    name: 'Animals',
    difficulty: 'easy',
    words: [
      'cat', 'dog', 'bird', 'fish', 'frog', 'bear', 'lion', 'tiger',
      'elephant', 'monkey', 'rabbit', 'horse', 'sheep', 'chicken', 'duck'
    ]
  },
  {
    id: '2',
    name: 'Colors',
    difficulty: 'easy',
    words: [
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
      'black', 'white', 'gray', 'gold', 'silver'
    ]
  },
  {
    id: '3',
    name: 'Food',
    difficulty: 'medium',
    words: [
      'apple', 'banana', 'orange', 'grape', 'pizza', 'bread', 'cheese',
      'milk', 'water', 'cookie', 'cake', 'candy', 'sandwich', 'salad'
    ]
  },
  {
    id: '4',
    name: 'School Words',
    difficulty: 'medium',
    words: [
      'teacher', 'student', 'pencil', 'paper', 'book', 'desk', 'chair',
      'classroom', 'homework', 'recess', 'library', 'computer', 'science'
    ]
  },
  {
    id: '5',
    name: 'Nature',
    difficulty: 'medium',
    words: [
      'tree', 'flower', 'grass', 'mountain', 'river', 'ocean', 'cloud',
      'rainbow', 'sunshine', 'butterfly', 'garden', 'forest'
    ]
  },
  {
    id: '6',
    name: 'Challenge Words',
    difficulty: 'hard',
    words: [
      'beautiful', 'wonderful', 'excellent', 'magnificent', 'adventure',
      'birthday', 'calendar', 'chocolate', 'different', 'everything',
      'favorite', 'holiday', 'important', 'interesting'
    ]
  }
];
