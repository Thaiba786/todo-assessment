import os
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from firebase_admin import auth as fb_auth, firestore
from firebase_admin_init import db as firebase_db
from pymongo import MongoClient
from bson.objectid import ObjectId

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "tododb")

mongo = MongoClient(MONGODB_URI)
mongo_db = mongo[MONGODB_DB]
notes_col = mongo_db["notes"]
users_col = mongo_db["users"]

app = FastAPI(title="Todo API (FastAPI + MongoDB + Firestore)")

# Allow React app to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NoteCreate(BaseModel):
    title: str
    content: str = ""
    completed: bool = False
    tags: str = ""

class NoteOut(NoteCreate):
    id: str

def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid Authorization header")
    id_token = authorization.split("Bearer ")[1]
    try:
        decoded = fb_auth.verify_id_token(id_token)
        return decoded
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token invalid: {e}")

def get_or_create_user(uid: str, email: str = ""):
    u = users_col.find_one({"firebase_uid": uid})
    if u:
        return u
    new = {"firebase_uid": uid, "email": email}
    res = users_col.insert_one(new)
    new["_id"] = res.inserted_id
    return new

@app.post("/notes", response_model=NoteOut)
def create_note(payload: NoteCreate, auth_payload: dict = Depends(verify_token)):
    uid = auth_payload["uid"]
    email = auth_payload.get("email", "")
    get_or_create_user(uid, email)

    note_doc = {
        "owner_uid": uid,
        "title": payload.title,
        "content": payload.content,
        "completed": payload.completed,
        "tags": payload.tags
    }
    res = notes_col.insert_one(note_doc)
    note_id = str(res.inserted_id)

    # 🔹 Firestore sync (optional, won’t crash if API disabled)
    try:
        firebase_db.collection("notes").document(f"note-{note_id}").set({
            "id": note_id,
            "owner_uid": uid,
            "title": payload.title,
            "content": payload.content,
            "completed": payload.completed,
            "tags": payload.tags,
            "updated_at": firestore.SERVER_TIMESTAMP
        })
    except Exception as e:
        print(f"[WARN] Firestore sync skipped: {e}")

    print(f"[DEBUG] Inserted note {note_id} into MongoDB")
    return NoteOut(id=note_id, **payload.dict())

@app.get("/notes")
def list_notes(auth_payload: dict = Depends(verify_token)):
    uid = auth_payload["uid"]
    docs = list(notes_col.find({"owner_uid": uid}))
    return [
        {
            "id": str(d["_id"]),
            "title": d.get("title", ""),
            "content": d.get("content", ""),
            "completed": d.get("completed", False),
            "tags": d.get("tags", "")
        }
        for d in docs
    ]

@app.put("/notes/{note_id}")
def update_note(note_id: str, payload: NoteCreate, auth_payload: dict = Depends(verify_token)):
    uid = auth_payload["uid"]
    notes_col.update_one({"_id": ObjectId(note_id), "owner_uid": uid}, {"$set": payload.dict()})

    try:
        firebase_db.collection("notes").document(f"note-{note_id}").set({
            "id": note_id,
            "owner_uid": uid,
            **payload.dict(),
            "updated_at": firestore.SERVER_TIMESTAMP
        }, merge=True)
    except Exception as e:
        print(f"[WARN] Firestore update skipped: {e}")

    print(f"[DEBUG] Updated note {note_id} in MongoDB")
    return {"ok": True}

@app.delete("/notes/{note_id}")
def delete_note(note_id: str, auth_payload: dict = Depends(verify_token)):
    uid = auth_payload["uid"]
    notes_col.delete_one({"_id": ObjectId(note_id), "owner_uid": uid})

    try:
        firebase_db.collection("notes").document(f"note-{note_id}").delete()
    except Exception as e:
        print(f"[WARN] Firestore delete skipped: {e}")

    print(f"[DEBUG] Deleted note {note_id} from MongoDB")
    return {"ok": True}
