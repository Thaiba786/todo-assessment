Charming Todo - Full Project (React CRA frontend + Python FastAPI backend + Firebase)
========================================================================================

Folders:
- backend/  : Python FastAPI backend (mirrors notes to Firestore and stores in MongoDB)
- todo-web/ : React (Create React App) frontend (Firebase Auth + Firestore realtime sync)

Important:
- Backend uses Firebase Admin SDK. The service account JSON is included (if you uploaded it).
  Keep it secret. Do NOT commit it to public repos. The backend .gitignore contains rules to ignore it.

Setup (backend):
1. Install Python 3.10+
2. Open terminal in backend folder
3. python -m venv .venv
4. .venv\Scripts\activate  (Windows) or source .venv/bin/activate (mac/linux)
5. pip install -r requirements.txt
6. Ensure MongoDB is running (localhost:27017) or update MONGODB_URI in .env
7. uvicorn main:app --reload --port 8000
8. Visit http://127.0.0.1:8000/docs for API docs

Setup (frontend):
1. Node.js + npm installed
2. cd todo-web
3. npm install
4. Replace src/firebaseConfig.js values with your Firebase web config
5. npm start
6. Visit http://localhost:3000

Security:
- The firebase_service_account.json is very sensitive. Do not share it.
- Use Firestore rules in Firebase console to restrict access to authenticated users only.

