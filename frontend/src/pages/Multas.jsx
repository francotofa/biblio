import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Search, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Multas = () => {
  const [multas, setMultas] = useState([]);
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ socio_id: '', prestamo_id: '', motivo: '', monto: '100' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [multasRes, sociosRes] = await Promise.all([api.get('/multas'), api.get('/socios')]);
      setMultas(multasRes.data);
      setSocios(sociosRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/multas', {
        socio_id: parseInt(formData.socio_id),
        prestamo_id: formData.prestamo_id,
        motivo: formData.motivo,
        monto: parseFloat(formData.monto),
      });
      toast.success('Multa creada exitosamente');
      setShowDialog(false);
      setFormData({ socio_id: '', prestamo_id: '', motivo: '', monto: '100' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear multa');
    }
  };

  const handlePagar = async (multaId) => {
    try {
      await api.put(`/multas/${multaId}/pagar`);
      toast.success('Multa marcada como pagada');
      fetchData();
    } catch (error) {
      toast.error('Error al procesar el pago');
    }
  };

  const filteredMultas = multas.filter(
    (multa) =>
      multa.socio_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      multa.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const multasPendientes = filteredMultas.filter((m) => m.estado === 'pendiente');
  const multasPagadas = filteredMultas.filter((m) => m.estado === 'pagada');

  const renderMulta = (multa) => (
    <Card
      key={multa.id}
      className={`${
        multa.estado === 'pendiente' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
      }`}
      data-testid={`multa-card-${multa.id}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  multa.estado === 'pendiente' ? 'bg-red-200' : 'bg-emerald-200'
                }`}
              >
                <AlertCircle
                  className={`w-5 h-5 ${
                    multa.estado === 'pendiente' ? 'text-red-700' : 'text-emerald-700'
                  }`}
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800">{multa.motivo}</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Socio: {multa.socio_nombre} (#{multa.socio_id})
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-slate-600">
                    <span className="font-medium">Monto:</span> ${multa.monto}
                  </span>
                  <span className="text-slate-600">
                    <span className="font-medium">Fecha:</span>{' '}
                    {format(new Date(multa.fecha), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                multa.estado === 'pendiente'
                  ? 'bg-red-200 text-red-800'
                  : 'bg-emerald-200 text-emerald-800'
              }`}
            >
              {multa.estado === 'pendiente' ? 'Pendiente' : 'Pagada'}
            </span>
            {multa.estado === 'pendiente' && (
              <Button
                size="sm"
                onClick={() => handlePagar(multa.id)}
                className="bg-emerald-600 hover:bg-emerald-700"
                data-testid={`pagar-multa-${multa.id}`}
              >
                Marcar Pagada
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Gestionar Multas</h2>
            <p className="text-slate-600 mt-1">Administra las multas de la biblioteca</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-200"
                data-testid="add-multa-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Multa
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Crear Nueva Multa</DialogTitle>
                <DialogDescription>Completa los datos de la multa</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="socio_id">Socio</Label>
                  <Select
                    value={formData.socio_id}
                    onValueChange={(value) => setFormData({ ...formData, socio_id: value })}
                    required
                  >
                    <SelectTrigger data-testid="select-socio-multa-trigger">
                      <SelectValue placeholder="Selecciona un socio" />
                    </SelectTrigger>
                    <SelectContent>
                      {socios.map((socio) => (
                        <SelectItem key={socio.numero_socio} value={socio.numero_socio.toString()}>
                          #{socio.numero_socio} - {socio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prestamo_id">ID de Préstamo (opcional)</Label>
                  <Input
                    id="prestamo_id"
                    value={formData.prestamo_id}
                    onChange={(e) => setFormData({ ...formData, prestamo_id: e.target.value })}
                    placeholder="Dejar vacío si no aplica"
                    data-testid="multa-prestamo-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo</Label>
                  <Input
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    required
                    placeholder="Ej: Libro extraviado"
                    data-testid="multa-motivo-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto ($)</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    required
                    data-testid="multa-monto-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="multa-submit-button">
                  Crear Multa
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por socio o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-multas-input"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Multas Pendientes */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Multas Pendientes ({multasPendientes.length})
                  </h3>
                  {multasPendientes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                      <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>No hay multas pendientes</p>
                    </div>
                  ) : (
                    <div className="space-y-3">{multasPendientes.map(renderMulta)}</div>
                  )}
                </div>

                {/* Multas Pagadas */}
                {multasPagadas.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">
                      Multas Pagadas ({multasPagadas.length})
                    </h3>
                    <div className="space-y-3">{multasPagadas.map(renderMulta)}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
