import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export default function AuthForm() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const provider = new GoogleAuthProvider();

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pwd);
      } else {
        await createUserWithEmailAndPassword(auth, email, pwd);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const googleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={submit} className="auth-card">
      <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">{mode === "login" ? "Login" : "Sign Up"}</button>
      <button type="button" className="google" onClick={googleSignIn}>
        Sign in with Google
      </button>
      <p className="toggle" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        Switch to {mode === "login" ? "Sign up" : "Login"}
      </p>
    </form>
  );
}
