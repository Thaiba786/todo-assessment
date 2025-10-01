const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const admin = require("./firebase_admin");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// --- MongoDB Connection ---
let db;
MongoClient.connect(MONGO_URI)
  .then((client) => {
    db = client.db("tododb"); // ✅ use tododb instead of creating new "todo"
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Middleware: Verify Firebase Auth Token ---
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
}

// --- CRUD Routes ---

// ✅ GET all notes
app.get("/notes", authenticate, async (req, res) => {
  try {
    const userId = req.user.uid;
    const search = req.query.search || "";

    const query = {
      userId: userId,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ],
    };

    const notes = await db
      .collection("notes")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = notes.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      content: n.content,
      completed: n.completed,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching notes");
  }
});

// ✅ Create note
app.post("/notes", authenticate, async (req, res) => {
  try {
    const note = {
      userId: req.user.uid,
      title: req.body.title,
      content: req.body.content,
      completed: false,
      createdAt: new Date(),
    };
    const result = await db.collection("notes").insertOne(note);
    res.json({ id: result.insertedId.toString(), ...note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update note
app.put("/notes/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const update = {
      $set: {
        title: req.body.title,
        content: req.body.content,
        completed: req.body.completed,
      },
    };
    const result = await db
      .collection("notes")
      .updateOne({ _id: new ObjectId(id), userId: req.user.uid }, update);

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Note not found" });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete note
app.delete("/notes/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .collection("notes")
      .deleteOne({ _id: new ObjectId(id), userId: req.user.uid });

    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Note not found" });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
);
