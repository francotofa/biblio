from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid

# Auth Models
class UsuarioLogin(BaseModel):
    username: str
    password: str

class Usuario(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    nombre: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    usuario: Usuario

# Libro Models
class LibroCreate(BaseModel):
    isbn: str
    titulo: str
    autor: str
    imagen_url: Optional[str] = ""

class Libro(BaseModel):
    model_config = ConfigDict(extra="ignore")
    isbn: str
    titulo: str
    autor: str
    imagen_url: Optional[str] = ""
    estado: str = "disponible"  # disponible o prestado

class LibroDetalle(Libro):
    historial_prestamos: List[dict] = []

# Socio Models
class SocioCreate(BaseModel):
    nombre: str
    nro_documento: str

class Socio(BaseModel):
    model_config = ConfigDict(extra="ignore")
    numero_socio: int
    nombre: str
    nro_documento: str
    fecha_registro: str

class SocioDetalle(Socio):
    prestamo_activo: Optional[dict] = None
    multas_pendientes: List[dict] = []

# Prestamo Models
class PrestamoCreate(BaseModel):
    libro_isbn: str
    socio_id: int

class Prestamo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    libro_isbn: str
    socio_id: int
    fecha_inicio: str
    fecha_devolucion: Optional[str] = None
    estado: str = "activo"  # activo o devuelto

class DevolucionRequest(BaseModel):
    libro_danado: bool = False

# Multa Models
class MultaCreate(BaseModel):
    socio_id: int
    prestamo_id: str
    motivo: str
    monto: float = 100.0

class Multa(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    socio_id: int
    prestamo_id: str
    motivo: str
    monto: float
    fecha: str
    estado: str = "pendiente"  # pendiente o pagada

# Dashboard Stats
class DashboardStats(BaseModel):
    total_libros: int
    libros_disponibles: int
    total_socios: int
    prestamos_activos: int
    multas_pendientes: int
