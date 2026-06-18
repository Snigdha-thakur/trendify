from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.db_migrations import (
    ensure_coupons_table,
    ensure_digital_product_columns,
    ensure_platform_settings_table,
)
from app.api.routes import auth, users, payments, products, admin, wallets, coupons, realtime
import traceback

app = FastAPI(title=settings.API_TITLE, version=settings.API_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print(f"UNHANDLED ERROR on {request.method} {request.url}:\n{tb}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": tb},
        headers={"Access-Control-Allow-Origin": "*"},
    )

# Ensure product schema compatibility and coupon table readiness on startup.
try:
    ensure_digital_product_columns()
    ensure_coupons_table()
    ensure_platform_settings_table()
except Exception as e:
    print(f"[startup] DB migration warning: {e}")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(payments.router)
app.include_router(products.router)
app.include_router(coupons.router)
app.include_router(admin.router)
app.include_router(wallets.router)
app.include_router(realtime.router)


@app.get("/")
def root():
    return {"message": "Trendify API", "version": settings.API_VERSION, "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
