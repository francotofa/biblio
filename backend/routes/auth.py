from fastapi import APIRouter, HTTPException, Depends
from models.schemas import UsuarioLogin, TokenResponse, Usuario
from motor.motor_asyncio import AsyncIOMotorDatabase
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
import os
from middleware.auth import verify_token

router = APIRouter()

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'biblioteca-secret-key-2024')
ALGORITHM = "HS256"

def get_db():
    from server import db
    return db

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UsuarioLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Buscar usuario
    usuario = await db.usuarios.find_one({"username": credentials.username}, {"_id": 0})
    
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    # Verificar contraseña
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), usuario['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    # Crear token JWT
    token_data = {
        "sub": usuario['username'],
        "id": usuario['id'],
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    usuario_response = Usuario(
        id=usuario['id'],
        username=usuario['username'],
        nombre=usuario['nombre']
    )
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        usuario=usuario_response
    )

@router.get("/me", response_model=Usuario)
async def get_current_user(payload: dict = Depends(verify_token), db: AsyncIOMotorDatabase = Depends(get_db)):
    usuario = await db.usuarios.find_one({"username": payload['sub']}, {"_id": 0, "password": 0})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return Usuario(**usuario)
