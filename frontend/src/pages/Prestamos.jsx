import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, FileText, BookOpen, User } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrestamos();
  }, []);

  const fetchPrestamos = async () => {
    try {
      const response = await api.get('/prestamos');
      setPrestamos(response.data);
    } catch (error) {
      toast.error('Error al cargar préstamos');
    } finally {
      setLoading(false);
    }
  };

  const prestamosActivos = prestamos.filter((p) => p.estado === 'activo');
  const prestamosDevueltos = prestamos.filter((p) => p.estado === 'devuelto');

  const renderPrestamoCard = (prestamo) => (
    <Card key={prestamo.id} className="bg-white hover:shadow-md transition-shadow" data-testid={`prestamo-card-${prestamo.id}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 flex-1">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800">{prestamo.libro_titulo}</h4>
              <p className="text-sm text-slate-600">{prestamo.libro_autor}</p>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">{prestamo.socio_nombre}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Socio #{prestamo.socio_id}</span>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-slate-500">
                <div>
                  <span className="font-medium">Inicio:</span>{' '}
                  {format(new Date(prestamo.fecha_inicio), 'dd MMM yyyy', { locale: es })}
                </div>
                {prestamo.fecha_devolucion && (
                  <div>
                    <span className="font-medium">Devolución:</span>{' '}
                    {format(new Date(prestamo.fecha_devolucion), 'dd MMM yyyy', { locale: es })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              prestamo.estado === 'activo' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {prestamo.estado === 'activo' ? 'Activo' : 'Devuelto'}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Gestionar Préstamos</h2>
            <p className="text-slate-600 mt-1">Administra los préstamos de la biblioteca</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/prestamos/nuevo')}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-200"
              data-testid="nuevo-prestamo-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Préstamo
            </Button>
            <Button
              onClick={() => navigate('/prestamos/devolucion')}
              variant="outline"
              className="border-violet-300 text-violet-700 hover:bg-violet-50"
              data-testid="registrar-devolucion-button"
            >
              <FileText className="w-4 h-4 mr-2" />
              Registrar Devolución
            </Button>
          </div>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-slate-200">
          <CardContent className="p-6">
            <Tabs defaultValue="activos" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="activos" data-testid="tab-activos">
                  Activos ({prestamosActivos.length})
                </TabsTrigger>
                <TabsTrigger value="historial" data-testid="tab-historial">
                  Historial ({prestamosDevueltos.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activos" className="mt-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-500"></div>
                  </div>
                ) : prestamosActivos.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay préstamos activos</p>
                  </div>
                ) : (
                  <div className="space-y-3">{prestamosActivos.map(renderPrestamoCard)}</div>
                )}
              </TabsContent>

              <TabsContent value="historial" className="mt-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-500"></div>
                  </div>
                ) : prestamosDevueltos.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay préstamos en el historial</p>
                  </div>
                ) : (
                  <div className="space-y-3">{prestamosDevueltos.map(renderPrestamoCard)}</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
