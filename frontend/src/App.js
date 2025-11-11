import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import pages
import MainPage from "./pages/MainPage.js";
import ProfilePage from "./pages/ProfilePage.js";
import LoginPage from "./pages/LoginPage.js";
import RegisterPage from "./pages/RegisterPage.js";
import CoursePage from "./pages/CoursePage.js";
import CourseDetailPage from "./pages/CourseDetailPage.js";
import RecipePage from "./pages/RecipePage.js";
import PostBlogPage from "./pages/PostBlogPage.js";
import AdminDashboard from "./pages/admin/MainPage.js";
import RequireAdmin from './components/RequireAdmin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/coursedetail" element={<CourseDetailPage />} />
        <Route path="/recipe" element={<RecipePage />} />
        <Route path="/postblog" element={<PostBlogPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
