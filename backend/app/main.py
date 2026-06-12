from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, users, payments, products, admin, wallets

app = FastAPI(title=settings.API_TITLE, version=settings.API_VERSION)

app.add_middleware(
    CORSMiddleware,
    # Allow the configured frontend URL, common deploy hosts and localhost for development.
    allow_origins=[
        settings.FRONTEND_URL, 
        "http://localhost:3001",
        "http://localhost:5173", 
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app$|https://.*\.onrender\.com$|http://localhost:\d+$|http://127\.0\.0\.1:\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(payments.router)
app.include_router(products.router)
app.include_router(admin.router)
app.include_router(wallets.router)


@app.get("/")
def root():
    return {"message": "Trendify API", "version": settings.API_VERSION, "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
