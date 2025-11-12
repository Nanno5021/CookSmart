import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import pages
import MainPage from "./pages/MainPage.js";
import ProfilePage from "./pages/ProfilePage.js";
import LoginPage from "./pages/LoginPage.js";
import RegisterPage from "./pages/RegisterPage.js";
import CoursePage from "./pages/CoursePage.js";
import CourseDetailPage from "./pages/CourseDetailPage.js";
import EnrolledDetail from "./pages/EnrolledDetail.js";
import RecipePage from "./pages/RecipePage.js";
import RecipeDetailPage from "./pages/RecipeDetailPage.js";
import ChefRecipePage from "./pages/chef/ChefRecipePage.js";
import AddRecipePage from "./pages/chef/AddRecipePage.js";
import EditRecipePage from "./pages/chef/EditRecipePage.js";
import PostBlogPage from "./pages/PostBlogPage.js";
import ChefCoursePage from "./pages/chef/ChefCoursePage.js";
import AddCoursePage from "./pages/chef/AddCoursePage.js";
import AdminDashboard from "./pages/admin/MainPage.js";
import EditProfilePage from "./pages/EditProfilePage.js";
import RequireAdmin from './components/RequireAdmin';
import EditCoursePage from "./pages/chef/EditCoursePage.js";
import ChefMainPage from "./pages/chef/MainPage.js";
import RequestChefAccountPage from "./pages/chef/RequestChefAccountPage.js";
import BlogDetails from "./pages/BlogDetails.js";
import CheckStatus from "./pages/CheckStatus.js";

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
        <Route path="/enrolleddetail" element={<EnrolledDetail />} />
        <Route path="/recipe" element={<RecipePage />} />
        <Route path="/recipedetail" element={<RecipeDetailPage />} />
        <Route path="/chefrecipe" element={<ChefRecipePage />} />
        <Route path="/addrecipe" element={<AddRecipePage />} />
        <Route path="/editrecipe/:recipeId" element={<EditRecipePage />} />
        <Route path="/postblog" element={<PostBlogPage />} />
        <Route path="/editprofile" element={<EditProfilePage />} />
        <Route path="/chefcourse" element={<ChefCoursePage />} />
        <Route path="/addcourse" element={<AddCoursePage />} />
        <Route path="/editcourse/:courseId" element={<EditCoursePage />} />
        <Route path="/requestchef" element={<RequestChefAccountPage />} />
        <Route path="/posts/:id" element={<BlogDetails />} />
        <Route path="/checkstatus" element={<CheckStatus />} />

        <Route path="/chef" element={<ChefMainPage />} />
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
