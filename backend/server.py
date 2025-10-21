from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import bcrypt
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Import routes
from routes import auth, libros, socios, prestamos, multas, dashboard

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(libros.router, prefix="/libros", tags=["libros"])
api_router.include_router(socios.router, prefix="/socios", tags=["socios"])
api_router.include_router(prestamos.router, prefix="/prestamos", tags=["prestamos"])
api_router.include_router(multas.router, prefix="/multas", tags=["multas"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize default user on startup
@app.on_event("startup")
async def startup_event():
    # Crear usuario por defecto si no existe
    existing_user = await db.usuarios.find_one({"username": "admin"})
    if not existing_user:
        hashed_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        usuario = {
            "id": str(uuid.uuid4()),
            "username": "admin",
            "password": hashed_password.decode('utf-8'),
            "nombre": "Bibliotecario Principal"
        }
        await db.usuarios.insert_one(usuario)
        logger.info("Usuario por defecto creado: admin / admin123")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
