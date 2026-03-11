import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { GameOptions } from "./pages/GameOptions";
import { SpellingBee } from "./pages/games/SpellingBee";
import { WordScramble } from "./pages/games/WordScramble";
import { MissingLetters } from "./pages/games/MissingLetters";
import { Alphabetical } from "./pages/games/Alphabetical";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/game-options",
    Component: GameOptions,
  },
  {
    path: "/game/spelling-bee",
    Component: SpellingBee,
  },
  {
    path: "/game/word-scramble",
    Component: WordScramble,
  },
  {
    path: "/game/missing-letters",
    Component: MissingLetters,
  },
  {
    path: "/game/alphabetical",
    Component: Alphabetical,
  },
]);
