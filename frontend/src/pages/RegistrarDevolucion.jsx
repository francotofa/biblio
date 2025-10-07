import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

export const RegistrarDevolucion = () => {
  const [prestamosActivos, setPrestamosActivos] = useState([]);
  const [selectedPrestamo, setSelectedPrestamo] = useState('');
  const [libroDanado, setLibroDanado] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrestamosActivos();
  }, []);

  const fetchPrestamosActivos = async () => {
    try {
      const response = await api.get('/prestamos?estado=activo');
      setPrestamosActivos(response.data);
    } catch (error) {
      toast.error('Error al cargar préstamos activos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/prestamos/${selectedPrestamo}/devolucion`, {
        libro_danado: libroDanado,
      });
      toast.success(
        libroDanado
          ? 'Devolución registrada. Se creó una multa por daños'
          : 'Devolución registrada exitosamente'
      );
      navigate('/prestamos');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrar devolución');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/prestamos')} data-testid="back-to-prestamos-button">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Préstamos
        </Button>

        <Card className="bg-white/70 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle>Registrar Devolución</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prestamo">Seleccionar Préstamo Activo</Label>
                <Select value={selectedPrestamo} onValueChange={setSelectedPrestamo} required>
                  <SelectTrigger id="prestamo" data-testid="select-prestamo-trigger">
                    <SelectValue placeholder="Selecciona un préstamo" />
                  </SelectTrigger>
                  <SelectContent>
                    {prestamosActivos.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">No hay préstamos activos</div>
                    ) : (
                      prestamosActivos.map((prestamo) => (
                        <SelectItem key={prestamo.id} value={prestamo.id} data-testid={`prestamo-option-${prestamo.id}`}>
                          {prestamo.libro_titulo} - {prestamo.socio_nombre} (Socio #{prestamo.socio_id})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start space-x-3 border border-slate-200 rounded-lg p-4">
                <Checkbox
                  id="libro_danado"
                  checked={libroDanado}
                  onCheckedChange={setLibroDanado}
                  data-testid="libro-danado-checkbox"
                />
                <div className="space-y-1">
                  <Label htmlFor="libro_danado" className="text-base font-medium cursor-pointer">
                    ¿Libro devuelto con daños?
                  </Label>
                  <p className="text-sm text-slate-500">
                    Al marcar esta opción, se creará automáticamente una multa de $150 para el socio.
                  </p>
                </div>
              </div>

              {libroDanado && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-700">
                      <p className="font-medium">Multa por libro dañado</p>
                      <p className="text-slate-600 mt-1">
                        Se registrará una multa de $150 con el motivo "Libro devuelto con daños". El socio deberá pagar
                        esta multa antes de poder realizar un nuevo préstamo.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                disabled={loading || !selectedPrestamo}
                data-testid="submit-devolucion-button"
              >
                {loading ? 'Registrando...' : 'Registrar Devolución'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
