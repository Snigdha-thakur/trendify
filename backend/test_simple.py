from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API is working"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/auth/login")
async def test_login():
    try:
        from app.models.models import User
        from app.core.database import SessionLocal
        
        db = SessionLocal()
        user = db.query(User).filter(User.email == "soumyaofficial2004@gmail.com").first()
        db.close()
        
        if user:
            return {"status": "found user", "name": user.name}
        return {"status": "user not found"}
    except Exception as e:
        return {"error": str(e), "type": str(type(e))}
