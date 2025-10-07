import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import pages
import MainPage from "./pages/MainPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CoursePage from "./pages/CoursePage";
import RecipePage from "./pages/RecipePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/recipe" element={<RecipePage />} />
      </Routes>
    </Router>
  );
}

export default App;
