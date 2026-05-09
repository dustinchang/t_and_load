import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { CourseProvider } from "./context/CourseContext";
import { GameProvider } from "./context/GameContext";
import { HomePage } from "./pages/HomePage";
import { CourseSelectPage } from "./pages/CourseSelectPage";
import { SetupRoundPage } from "./pages/SetupRoundPage";
import { PlayPage } from "./pages/PlayPage";
import { ScorecardPage } from "./pages/ScorecardPage";

export default function App() {
  return (
    <ThemeProvider>
      <CourseProvider>
        <GameProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CourseSelectPage />} />
            <Route path="/setup" element={<SetupRoundPage />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/scorecard" element={<ScorecardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </GameProvider>
      </CourseProvider>
    </ThemeProvider>
  );
}
