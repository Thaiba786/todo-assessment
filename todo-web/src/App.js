import React from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthForm from "./components/AuthForm";
import NoteList from "./components/NoteList"; // ✅ make sure the file is NoteList.js
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import "./styles.css";

function AppInner() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="app">
      <header className="header">
        <h1>✨ Charming Todo ✨</h1>
        {user && (
          <div>
            <span>{user.email}</span>
            <button onClick={() => signOut(auth)}>Logout</button>
          </div>
        )}
      </header>
      <main>{user ? <NoteList /> : <AuthForm />}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
