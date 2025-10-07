import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, BookOpen, Calendar, User } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const LibroDetalle = () => {
  const { isbn } = useParams();
  const [libro, setLibro] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLibroDetalle();
  }, [isbn]);

  const fetchLibroDetalle = async () => {
    try {
      const response = await api.get(`/libros/${isbn}`);
      setLibro(response.data);
    } catch (error) {
      toast.error('Error al cargar detalles del libro');
      navigate('/libros');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/libros')} data-testid="back-to-libros-button">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Libros
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Libro */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 lg:col-span-1">
            <CardHeader>
              <CardTitle>Información del Libro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full aspect-[2/3] bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg overflow-hidden">
                {libro.imagen_url ? (
                  <img src={libro.imagen_url} alt={libro.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800">{libro.titulo}</h3>
                <p className="text-slate-600 mt-1">{libro.autor}</p>
                <p className="text-sm text-slate-500 mt-2">ISBN: {libro.isbn}</p>
                <div className="mt-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      libro.estado === 'disponible'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {libro.estado === 'disponible' ? 'Disponible' : 'Prestado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Préstamos */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 lg:col-span-2">
            <CardHeader>
              <CardTitle>Historial de Préstamos</CardTitle>
            </CardHeader>
            <CardContent>
              {libro.historial_prestamos.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Este libro aún no ha sido prestado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {libro.historial_prestamos.map((prestamo) => (
                    <Card key={prestamo.id} className="bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{prestamo.socio_nombre}</p>
                              <p className="text-sm text-slate-600">Socio #{prestamo.socio_id}</p>
                              <div className="flex gap-4 mt-2 text-xs text-slate-500">
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
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              prestamo.estado === 'activo'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {prestamo.estado === 'activo' ? 'Activo' : 'Devuelto'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
