import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState("");

  useEffect(() => {
    // Fetch users from .NET backend
    axios
      .get("http://localhost:5037/api/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, []);

  const addUser = () => {
    if (!newUser.trim()) return;
    axios
      .post("http://localhost:5037/api/users", { user: newUser })
      .then((response) => {
        setUsers((prev) => [...prev, response.data]);
        setNewUser("");
      })
      .catch((error) => {
        console.error("Error adding user:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Navbar */}
      <div className="w-full bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Threads</h1>
        <span className="text-gray-500">🚀</span>
      </div>

      {/* Input box */}
      <div className="w-full max-w-md mt-6 bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="What's on your mind?"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={addUser}
          className="mt-3 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Post
        </button>
      </div>

      {/* Feed */}
      <div className="w-full max-w-md mt-6 space-y-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-gray-800">@{u.username}</h2>
            <p className="text-gray-600 mt-1">
              Just joined! 👋
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
