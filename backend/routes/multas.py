from fastapi import APIRouter, HTTPException, Depends, Query
from models.schemas import Multa, MultaCreate
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime, timezone
from middleware.auth import verify_token

router = APIRouter()

def get_db():
    from server import db
    return db

@router.get("", response_model=List[dict])
async def get_multas(
    socio_id: Optional[int] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
    _: dict = Depends(verify_token)
):
    query = {}
    if socio_id is not None:
        query["socio_id"] = socio_id
    
    multas = await db.multas.find(query, {"_id": 0}).to_list(1000)
    
    # Enriquecer con nombre del socio
    result = []
    for multa in multas:
        socio = await db.socios.find_one({"numero_socio": multa['socio_id']}, {"_id": 0})
        result.append({
            **multa,
            "socio_nombre": socio['nombre'] if socio else "Desconocido"
        })
    
    return result

@router.post("", response_model=Multa)
async def create_multa(multa: MultaCreate, db: AsyncIOMotorDatabase = Depends(get_db), _: dict = Depends(verify_token)):
    # Verificar que el socio existe
    socio = await db.socios.find_one({"numero_socio": multa.socio_id})
    if not socio:
        raise HTTPException(status_code=404, detail="Socio no encontrado")
    
    multa_obj = Multa(
        socio_id=multa.socio_id,
        prestamo_id=multa.prestamo_id,
        motivo=multa.motivo,
        monto=multa.monto,
        fecha=datetime.now(timezone.utc).isoformat()
    )
    
    await db.multas.insert_one(multa_obj.model_dump())
    return multa_obj

@router.put("/{multa_id}/pagar", response_model=Multa)
async def pagar_multa(multa_id: str, db: AsyncIOMotorDatabase = Depends(get_db), _: dict = Depends(verify_token)):
    result = await db.multas.update_one(
        {"id": multa_id},
        {"$set": {"estado": "pagada"}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Multa no encontrada")
    
    multa = await db.multas.find_one({"id": multa_id}, {"_id": 0})
    return Multa(**multa)
