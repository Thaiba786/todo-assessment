// src/components/NoteEditor.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE; 
// ✅ must match backend-node

export default function NoteEditor({ existing = null, onClose }) {
  const { user, token } = useAuth();
  const [title, setTitle] = useState(existing?.title || "");
  const [content, setContent] = useState(existing?.content || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(existing?.title || "");
    setContent(existing?.content || "");
  }, [existing]);

  // --- Create ---
  async function createNote() {
    if (!user || !token) return alert("Please sign in first.");
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/notes`,
        { title, content, completed: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Note created ✅");
      if (onClose) onClose();
    } catch (err) {
      console.error("Create error:", err);
      alert(err.response?.data?.error || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  // --- Update ---
  async function updateNote() {
    if (!user || !token) return alert("Please sign in first.");
    if (!existing?.id) return alert("Note id missing for update.");
    setLoading(true);
    try {
      await axios.put(
        `${API_BASE}/notes/${existing.id}`,
        { title, content, completed: existing.completed || false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Note updated ✅");
      if (onClose) onClose();
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  // --- Delete ---
  async function deleteNote() {
    if (!user || !token) return alert("Please sign in first.");
    if (!existing?.id) return alert("Note id missing for delete.");
    if (!window.confirm("Delete this note?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/notes/${existing.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Note deleted 🗑️");
      if (onClose) onClose();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.error || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="editor">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
      />

      <div className="row">
        <button
          onClick={() => (existing ? updateNote() : createNote())}
          disabled={loading}
        >
          {existing ? "Save Changes" : "Create"}
        </button>

        {existing && (
          <button
            className="danger"
            onClick={deleteNote}
            disabled={loading}
          >
            Delete
          </button>
        )}

        <button
          className="muted"
          onClick={() => onClose && onClose()}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
