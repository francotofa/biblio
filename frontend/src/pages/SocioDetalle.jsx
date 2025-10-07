import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, User, CreditCard, FileText, AlertCircle, BookOpen } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const SocioDetalle = () => {
  const { numero_socio } = useParams();
  const [socio, setSocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSocioDetalle();
  }, [numero_socio]);

  const fetchSocioDetalle = async () => {
    try {
      const response = await api.get(`/socios/${numero_socio}`);
      setSocio(response.data);
    } catch (error) {
      toast.error('Error al cargar detalles del socio');
      navigate('/socios');
    } finally {
      setLoading(false);
    }
  };

  const handlePagarMulta = async (multaId) => {
    try {
      await api.put(`/multas/${multaId}/pagar`);
      toast.success('Multa marcada como pagada');
      fetchSocioDetalle();
    } catch (error) {
      toast.error('Error al procesar el pago');
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
        <Button variant="ghost" onClick={() => navigate('/socios')} data-testid="back-to-socios-button">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Socios
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Socio */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle>Información del Socio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-6 rounded-full">
                  <User className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl text-slate-800">{socio.nombre}</h3>
                <p className="text-slate-600 mt-1">Socio #{socio.numero_socio}</p>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">Documento:</span>
                  <span className="font-medium text-slate-800">{socio.nro_documento}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">Registro:</span>
                  <span className="font-medium text-slate-800">
                    {format(new Date(socio.fecha_registro), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            {/* Préstamo Activo */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Préstamo Activo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {socio.prestamo_activo ? (
                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-800">{socio.prestamo_activo.libro_titulo}</h4>
                          <p className="text-sm text-slate-600 mt-1">ISBN: {socio.prestamo_activo.libro_isbn}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            Fecha de préstamo:{' '}
                            {format(new Date(socio.prestamo_activo.fecha_inicio), 'dd MMM yyyy', { locale: es })}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full font-medium">
                          Activo
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No tiene préstamos activos</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Multas Pendientes */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Multas Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {socio.multas_pendientes.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No tiene multas pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {socio.multas_pendientes.map((multa) => (
                      <Card key={multa.id} className="bg-red-50 border-red-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">{multa.motivo}</h4>
                              <p className="text-sm text-slate-600 mt-1">Monto: ${multa.monto}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                Fecha: {format(new Date(multa.fecha), 'dd MMM yyyy', { locale: es })}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handlePagarMulta(multa.id)}
                              className="bg-emerald-600 hover:bg-emerald-700"
                              data-testid={`pagar-multa-${multa.id}`}
                            >
                              Marcar como Pagada
                            </Button>
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
      </div>
    </Layout>
  );
};
