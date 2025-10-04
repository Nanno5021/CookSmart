import React from "react";
import Navbar from "../components/Navbar";

function MainPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <h1 className="text-center text-3xl font-bold mt-10">Main Feed Page</h1>
    </div>
  );
}

export default MainPage;
