"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST ||  "http://localhost:5000";
const BG_COLOR = process.env.NEXT_PUBLIC_BG_COLOR || "#f5f5f5";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await axios.get(`${API_HOST}/api/notes`);
    setNotes(res.data);
    setLoading(false);
  };

  const addNote = async () => {
    if (!text.trim()) return; // Don't add empty notes
    const res = await axios.post(`${API_HOST}/api/notes`, { text });
    fetchNotes();
    setText("");
  };

  const deleteNote = async (id) => {
    await axios.delete(`${API_HOST}/api/notes/${id}`);
    setNotes(notes.filter((note) => note._id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addNote();
    }
  };

  return (
    <div
      style={{
        backgroundColor: BG_COLOR,
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h1
          style={{
            color: "#333",
            textAlign: "center",
            marginBottom: "30px",
            fontWeight: "600",
          }}
        >
          Notes App
        </h1>

        <div
          style={{
            display: "flex",
            marginBottom: "30px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <input
            style={{
              flex: 1,
              padding: "12px 15px",
              border: "none",
              fontSize: "16px",
              outline: "none",
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new note..."
          />
          <button
            onClick={addNote}
            style={{
              padding: "12px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
          >
            Add
          </button>
        </div>

        <div>
          {loading ? (
            <p style={{ textAlign: "center", color: "#666" }}>
              Loading notes...
            </p>
          ) : notes.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#999",
                fontStyle: "italic",
                padding: "20px",
              }}
            >
              No notes yet. Add your first note above!
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                style={{
                  backgroundColor: "white",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    flex: 1,
                    wordBreak: "break-word",
                  }}
                >
                  {note.text}
                </p>
                <button
                  onClick={() => deleteNote(note._id)}
                  style={{
                    backgroundColor: "#ff4d4d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    marginLeft: "15px",
                    flexShrink: 0,
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#e60000")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#ff4d4d")
                  }
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
