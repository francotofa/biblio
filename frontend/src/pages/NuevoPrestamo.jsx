import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

export const NuevoPrestamo = () => {
  const [libros, setLibros] = useState([]);
  const [socios, setSocios] = useState([]);
  const [selectedLibro, setSelectedLibro] = useState('');
  const [selectedSocio, setSelectedSocio] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [librosRes, sociosRes] = await Promise.all([api.get('/libros'), api.get('/socios')]);
      setLibros(librosRes.data.filter((l) => l.estado === 'disponible'));
      setSocios(sociosRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/prestamos', {
        libro_isbn: selectedLibro,
        socio_id: parseInt(selectedSocio),
      });
      toast.success('Préstamo registrado exitosamente');
      navigate('/prestamos');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Error al crear préstamo';
      toast.error(errorMsg);
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
            <CardTitle>Nuevo Préstamo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="libro">Seleccionar Libro</Label>
                <Select value={selectedLibro} onValueChange={setSelectedLibro} required>
                  <SelectTrigger id="libro" data-testid="select-libro-trigger">
                    <SelectValue placeholder="Selecciona un libro disponible" />
                  </SelectTrigger>
                  <SelectContent>
                    {libros.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">No hay libros disponibles</div>
                    ) : (
                      libros.map((libro) => (
                        <SelectItem key={libro.isbn} value={libro.isbn} data-testid={`libro-option-${libro.isbn}`}>
                          {libro.titulo} - {libro.autor} (ISBN: {libro.isbn})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="socio">Seleccionar Socio</Label>
                <Select value={selectedSocio} onValueChange={setSelectedSocio} required>
                  <SelectTrigger id="socio" data-testid="select-socio-trigger">
                    <SelectValue placeholder="Selecciona un socio" />
                  </SelectTrigger>
                  <SelectContent>
                    {socios.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">No hay socios registrados</div>
                    ) : (
                      socios.map((socio) => (
                        <SelectItem
                          key={socio.numero_socio}
                          value={socio.numero_socio.toString()}
                          data-testid={`socio-option-${socio.numero_socio}`}
                        >
                          #{socio.numero_socio} - {socio.nombre} (Doc: {socio.nro_documento})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <p className="font-medium mb-1">Validaciones automáticas:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>El socio no debe tener préstamos activos</li>
                      <li>El socio no debe tener multas pendientes</li>
                      <li>El libro debe estar disponible</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                disabled={loading || !selectedLibro || !selectedSocio}
                data-testid="submit-prestamo-button"
              >
                {loading ? 'Registrando...' : 'Registrar Préstamo'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
