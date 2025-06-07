from fastapi import APIRouter, Response, Request, Cookie, HTTPException
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from uuid import uuid4
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

router = APIRouter()

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
EXPIRE_DAYS = 365

def create_token(uuid_str: str):
    expire = datetime.utcnow() + timedelta(days=EXPIRE_DAYS)
    to_encode = {"uuid": uuid_str, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["uuid"]
    except JWTError:
        return None

@router.get("/auth/init")
def init_uuid(auth_token: str = Cookie(None)):
    if auth_token:
        uuid = verify_token(auth_token)
        if uuid:
            return JSONResponse(content={"message": "Token valid"}, status_code=200)

    device_id = str(uuid4())
    token = create_token(device_id)
    response = JSONResponse(content={"message": "Token set"}, status_code=200)
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=60 * 60 * 24 * EXPIRE_DAYS,
        path="/"
    )
    return response

@router.get("/auth/refresh")
def refresh_token(auth_token: str = Cookie(None)):
    if not auth_token:
        return JSONResponse(content={"error": "No token provided"}, status_code=401)

    uuid = verify_token(auth_token)
    if not uuid:
        return JSONResponse(content={"error": "Invalid or expired token"}, status_code=401)

    new_token = create_token(uuid)
    response = JSONResponse(content={"message": "Token refreshed"}, status_code=200)
    response.set_cookie(
        key="auth_token",
        value=new_token,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=60 * 60 * 24 * EXPIRE_DAYS,
        path="/"
    )
    return response
