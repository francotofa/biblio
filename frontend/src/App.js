import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Libros } from "./pages/Libros";
import { LibroDetalle } from "./pages/LibroDetalle";
import { Socios } from "./pages/Socios";
import { SocioDetalle } from "./pages/SocioDetalle";
import { Prestamos } from "./pages/Prestamos";
import { NuevoPrestamo } from "./pages/NuevoPrestamo";
import { RegistrarDevolucion } from "./pages/RegistrarDevolucion";
import { Multas } from "./pages/Multas";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/libros"
            element={
              <ProtectedRoute>
                <Libros />
              </ProtectedRoute>
            }
          />
          <Route
            path="/libros/:isbn"
            element={
              <ProtectedRoute>
                <LibroDetalle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/socios"
            element={
              <ProtectedRoute>
                <Socios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/socios/:numero_socio"
            element={
              <ProtectedRoute>
                <SocioDetalle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prestamos"
            element={
              <ProtectedRoute>
                <Prestamos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prestamos/nuevo"
            element={
              <ProtectedRoute>
                <NuevoPrestamo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prestamos/devolucion"
            element={
              <ProtectedRoute>
                <RegistrarDevolucion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/multas"
            element={
              <ProtectedRoute>
                <Multas />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
