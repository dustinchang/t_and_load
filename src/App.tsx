import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { GameProvider } from "./context/GameContext";
import { HomePage } from "./pages/HomePage";
import { SetupRoundPage } from "./pages/SetupRoundPage";
import { PlayPage } from "./pages/PlayPage";
import { ScorecardPage } from "./pages/ScorecardPage";

export default function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<SetupRoundPage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/scorecard" element={<ScorecardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GameProvider>
    </ThemeProvider>
  );
}
