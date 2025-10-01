// src/components/NoteList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import NoteEditor from "./NoteEditor";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function NoteList() {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch notes
  async function loadNotes(query = "") {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: query ? { search: query } : {},
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Error loading notes:", err);
    }
  }

  // Toggle complete
  async function toggleComplete(note) {
    try {
      await axios.put(
        `${API_BASE}/notes/${note.id}`,
        { ...note, completed: !note.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadNotes(search);
    } catch (err) {
      console.error("Error updating:", err);
    }
  }

  // Delete
  async function deleteNote(noteId) {
    try {
      await axios.delete(`${API_BASE}/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadNotes(search);
    } catch (err) {
      console.error("Error deleting:", err);
    }
  }

  useEffect(() => {
    loadNotes();
  }, [token]);

  return (
    <div className="notes-wrap">
      {/* 🔎 Search + Add */}
      <div className="topbar">
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadNotes(search)} // Enter key triggers search
        />
        <button onClick={() => setEditing({})}>+ New Note</button>
      </div>

      {/* 📝 Notes Grid */}
      <div className="notes-grid">
        {notes.length === 0 ? (
          <p>No notes found</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`note-card ${note.completed ? "done" : ""}`}
            >
              <h3 style={{ textDecoration: note.completed ? "line-through" : "" }}>
                {note.title}
              </h3>
              <p>{note.content}</p>

              <div className="meta">
                <span>{note.completed ? "✅ Completed" : "⏳ In Progress"}</span>
                <div className="actions">
                  <button onClick={() => toggleComplete(note)}>
                    {note.completed ? "Undo" : "Mark Complete"}
                  </button>
                  <button onClick={() => setEditing(note)}>✏️ Edit</button>
                  <button className="danger" onClick={() => deleteNote(note.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✏️ Editor */}
      {editing && (
        <div className="overlay">
          <NoteEditor
            existing={editing.id ? editing : null}
            onClose={() => {
              setEditing(null);
              loadNotes(search);
            }}
          />
        </div>
      )}
    </div>
  );
}
