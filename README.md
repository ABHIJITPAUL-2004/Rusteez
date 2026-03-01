# Railway Rust Detector (RAR)

A dual-analysis system comparing **HSV color detection** vs **Claude Vision AI** for railway rust inspection.

## Structure
```
rar/
├── backend/
│   ├── main.py          ← FastAPI server
│   ├── hsv_detector.py  ← HSV rust detection engine
│   ├── requirements.txt
│   └── .env.example
|   └── .env{
            # backend/.env (safe version for GitHub)
            ANTHROPIC_API_KEY=REPLACE_WITH_YOUR_KEY
            MAX_UPLOAD_SIZE_MB=20
            ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000	
|               #this helps makes sure our program work and can compare with other llm models 
|           }
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── pages/
    │   │   ├── UploadPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   └── DetailPage.jsx
    │   ├── components/
    │   │   ├── RustMeter.jsx
    │   │   └── SeverityBadge.jsx
    │   └── utils/api.js
    ├── index.html
    └── vite.config.js
```

## Quick Start

### 1. Backend
```bash
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

pip install -r requirements.txt
uvicorn main:app --reload
# Runs on http://localhost:8000
```

### 2. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Open browser
Visit **http://localhost:5173**

## API Endpoints
- `POST /analyze/both` — Run HSV + AI analysis simultaneously
- `POST /analyze/hsv`  — HSV only
- `POST /analyze/ai`   — Claude Vision only
- `GET  /health`       — Health check
