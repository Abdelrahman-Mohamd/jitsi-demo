import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./components/pages/HomePage";
import { MeetingPage } from "./components/pages/MeetingPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
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
