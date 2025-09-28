from fastapi import APIRouter, Depends
from models.schemas import DashboardStats
from motor.motor_asyncio import AsyncIOMotorDatabase
from middleware.auth import verify_token

router = APIRouter()

def get_db():
    from server import db
    return db

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncIOMotorDatabase = Depends(get_db), _: dict = Depends(verify_token)):
    total_libros = await db.libros.count_documents({})
    libros_disponibles = await db.libros.count_documents({"estado": "disponible"})
    total_socios = await db.socios.count_documents({})
    prestamos_activos = await db.prestamos.count_documents({"estado": "activo"})
    multas_pendientes = await db.multas.count_documents({"estado": "pendiente"})
    
    return DashboardStats(
        total_libros=total_libros,
        libros_disponibles=libros_disponibles,
        total_socios=total_socios,
        prestamos_activos=prestamos_activos,
        multas_pendientes=multas_pendientes
    )
