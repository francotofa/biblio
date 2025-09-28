from fastapi import APIRouter, HTTPException, Depends
from models.schemas import Libro, LibroCreate, LibroDetalle
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from middleware.auth import verify_token

router = APIRouter()

def get_db():
    from server import db
    return db

@router.get("", response_model=List[Libro])
async def get_libros(db: AsyncIOMotorDatabase = Depends(get_db), _: dict = Depends(verify_token)):
    libros = await db.libros.find({}, {"_id": 0}).to_list(1000)
    return libros

@router.get("/{isbn}", response_model=LibroDetalle)
async def get_libro(isbn: str, db: AsyncIOMotorDatabase = Depends(get_db), _: dict = Depends(verify_token)):
    libro = await db.libros.find_one({"isbn": isbn}, {"_id": 0})
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    
    # Obtener historial de préstamos
    prestamos = await db.prestamos.find({"libro_isbn": isbn}, {"_id": 0}).to_list(1000)
    
    # Enriquecer con datos del socio
    historial = []
    for prestamo in prestamos:
        socio = await db.socios.find_one({"numero_socio": prestamo['socio_id']}, {"_id": 0})
        historial.append({
            **prestamo,
            "socio_nombre": socio['nombre'] if socio else "Desconocido"
        })
    
    return LibroDetalle(**libro, historial_prestamos=historial)

@router.post("", response_model=Libro)
async def create_libro(libro: LibroCreate, db: AsyncIOMotorDatabase = Depends(get_db), _: dict = Depends(verify_token)):
    # Verificar si ya existe
    existing = await db.libros.find_one({"isbn": libro.isbn})
    if existing:
        raise HTTPException(status_code=400, detail="El ISBN ya existe")
    
    libro_obj = Libro(**libro.model_dump())
    await db.libros.insert_one(libro_obj.model_dump())
    return libro_obj

@router.put("/{isbn}/estado", response_model=Libro)
async def update_estado_libro(isbn: str, estado: str, db: AsyncIOMotorDatabase = Depends(get_db), _: dict = Depends(verify_token)):
    if estado not in ["disponible", "prestado"]:
        raise HTTPException(status_code=400, detail="Estado inválido")
    
    result = await db.libros.update_one(
        {"isbn": isbn},
        {"$set": {"estado": estado}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    
    libro = await db.libros.find_one({"isbn": isbn}, {"_id": 0})
    return Libro(**libro)
