import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./components/pages/HomePage";
import { MeetingPage } from "./components/pages/MeetingPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          {/* Test div to verify Tailwind is working */}
          <div className="hidden bg-red-500 text-white p-4">Tailwind Test</div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/meeting/:roomName" element={<MeetingPage />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
