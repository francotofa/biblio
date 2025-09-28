from fastapi import APIRouter, HTTPException, Depends, Query
from models.schemas import Prestamo, PrestamoCreate, DevolucionRequest
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime, timezone
from middleware.auth import verify_token

router = APIRouter()

def get_db():
    from server import db
    return db

@router.get("", response_model=List[dict])
async def get_prestamos(
    estado: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
    _: dict = Depends(verify_token)
):
    query = {}
    if estado:
        query["estado"] = estado
    
    prestamos = await db.prestamos.find(query, {"_id": 0}).to_list(1000)
    
    # Enriquecer con datos de libro y socio
    result = []
    for prestamo in prestamos:
        libro = await db.libros.find_one({"isbn": prestamo['libro_isbn']}, {"_id": 0})
        socio = await db.socios.find_one({"numero_socio": prestamo['socio_id']}, {"_id": 0})
        
        result.append({
            **prestamo,
            "libro_titulo": libro['titulo'] if libro else "Desconocido",
            "libro_autor": libro['autor'] if libro else "Desconocido",
            "socio_nombre": socio['nombre'] if socio else "Desconocido"
        })
    
    return result

@router.post("", response_model=Prestamo)
async def create_prestamo(prestamo: PrestamoCreate, db: AsyncIOMotorDatabase = Depends(get_db), _: dict = Depends(verify_token)):
    # Validación 1: Verificar que el socio existe
    socio = await db.socios.find_one({"numero_socio": prestamo.socio_id})
    if not socio:
        raise HTTPException(status_code=404, detail="El socio no existe")
    
    # Validación 2: Verificar que el socio NO tiene un préstamo activo
    prestamo_activo = await db.prestamos.find_one({
        "socio_id": prestamo.socio_id,
        "estado": "activo"
    })
    if prestamo_activo:
        raise HTTPException(status_code=400, detail="El socio ya tiene un préstamo activo")
    
    # Validación 3: Verificar que el socio NO tiene multas pendientes
    multa_pendiente = await db.multas.find_one({
        "socio_id": prestamo.socio_id,
        "estado": "pendiente"
    })
    if multa_pendiente:
        raise HTTPException(status_code=400, detail="El socio tiene multas pendientes de pago")
    
    # Validación 4: Verificar que el libro está disponible
    libro = await db.libros.find_one({"isbn": prestamo.libro_isbn})
    if not libro:
        raise HTTPException(status_code=404, detail="El libro no existe")
    if libro['estado'] != "disponible":
        raise HTTPException(status_code=400, detail="El libro no está disponible")
    
    # Crear préstamo
    prestamo_obj = Prestamo(
        libro_isbn=prestamo.libro_isbn,
        socio_id=prestamo.socio_id,
        fecha_inicio=datetime.now(timezone.utc).isoformat()
    )
    
    await db.prestamos.insert_one(prestamo_obj.model_dump())
    
    # Actualizar estado del libro
    await db.libros.update_one(
        {"isbn": prestamo.libro_isbn},
        {"$set": {"estado": "prestado"}}
    )
    
    return prestamo_obj

@router.put("/{prestamo_id}/devolucion", response_model=Prestamo)
async def registrar_devolucion(
    prestamo_id: str,
    devolucion: DevolucionRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    _: dict = Depends(verify_token)
):
    # Buscar préstamo
    prestamo = await db.prestamos.find_one({"id": prestamo_id}, {"_id": 0})
    if not prestamo:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    
    if prestamo['estado'] != "activo":
        raise HTTPException(status_code=400, detail="El préstamo ya fue devuelto")
    
    # Actualizar préstamo
    await db.prestamos.update_one(
        {"id": prestamo_id},
        {"$set": {
            "estado": "devuelto",
            "fecha_devolucion": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Actualizar estado del libro
    await db.libros.update_one(
        {"isbn": prestamo['libro_isbn']},
        {"$set": {"estado": "disponible"}}
    )
    
    # Si el libro está dañado, crear multa
    if devolucion.libro_danado:
        from models.schemas import Multa
        multa = Multa(
            socio_id=prestamo['socio_id'],
            prestamo_id=prestamo_id,
            motivo="Libro devuelto con daños",
            monto=150.0,
            fecha=datetime.now(timezone.utc).isoformat()
        )
        await db.multas.insert_one(multa.model_dump())
    
    # Obtener préstamo actualizado
    prestamo_updated = await db.prestamos.find_one({"id": prestamo_id}, {"_id": 0})
    return Prestamo(**prestamo_updated)
