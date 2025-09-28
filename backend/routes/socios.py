from fastapi import APIRouter, HTTPException, Depends
from models.schemas import Socio, SocioCreate, SocioDetalle
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from datetime import datetime, timezone
from middleware.auth import verify_token

router = APIRouter()

def get_db():
    from server import db
    return db

@router.get("", response_model=List[Socio])
async def get_socios(db: AsyncIOMotorDatabase = Depends(get_db), _: dict = Depends(verify_token)):
    socios = await db.socios.find({}, {"_id": 0}).to_list(1000)
    return socios

@router.get("/{numero_socio}", response_model=SocioDetalle)
async def get_socio(numero_socio: int, db: AsyncIOMotorDatabase = Depends(get_db), _: dict = Depends(verify_token)):
    socio = await db.socios.find_one({"numero_socio": numero_socio}, {"_id": 0})
    if not socio:
        raise HTTPException(status_code=404, detail="Socio no encontrado")
    
    # Obtener préstamo activo
    prestamo_activo = await db.prestamos.find_one(
        {"socio_id": numero_socio, "estado": "activo"},
        {"_id": 0}
    )
    
    # Enriquecer con datos del libro
    if prestamo_activo:
        libro = await db.libros.find_one({"isbn": prestamo_activo['libro_isbn']}, {"_id": 0})
        if libro:
            prestamo_activo['libro_titulo'] = libro['titulo']
    
    # Obtener multas pendientes
    multas = await db.multas.find(
        {"socio_id": numero_socio, "estado": "pendiente"},
        {"_id": 0}
    ).to_list(1000)
    
    return SocioDetalle(
        **socio,
        prestamo_activo=prestamo_activo,
        multas_pendientes=multas
    )

@router.post("", response_model=Socio)
async def create_socio(socio: SocioCreate, db: AsyncIOMotorDatabase = Depends(get_db), _: dict = Depends(verify_token)):
    # Validar documento único
    existing = await db.socios.find_one({"nro_documento": socio.nro_documento})
    if existing:
        raise HTTPException(status_code=400, detail="El número de documento ya está registrado")
    
    # Obtener el siguiente número de socio
    last_socio = await db.socios.find_one({}, sort=[("numero_socio", -1)])
    numero_socio = (last_socio['numero_socio'] + 1) if last_socio else 1
    
    socio_obj = Socio(
        numero_socio=numero_socio,
        nombre=socio.nombre,
        nro_documento=socio.nro_documento,
        fecha_registro=datetime.now(timezone.utc).isoformat()
    )
    
    await db.socios.insert_one(socio_obj.model_dump())
    return socio_obj
