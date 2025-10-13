import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Search, Eye, Users as UsersIcon } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Socios = () => {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', nro_documento: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSocios();
  }, []);

  const fetchSocios = async () => {
    try {
      const response = await api.get('/socios');
      setSocios(response.data);
    } catch (error) {
      toast.error('Error al cargar socios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/socios', formData);
      toast.success('Socio agregado exitosamente');
      setShowDialog(false);
      setFormData({ nombre: '', nro_documento: '' });
      fetchSocios();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al agregar socio');
    }
  };

  const filteredSocios = socios.filter(
    (socio) =>
      socio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.nro_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.numero_socio.toString().includes(searchTerm)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Gestionar Socios</h2>
            <p className="text-slate-600 mt-1">Administra los socios de la biblioteca</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-200"
                data-testid="add-socio-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Socio
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Socio</DialogTitle>
                <DialogDescription>Completa los datos del socio</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    data-testid="socio-nombre-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nro_documento">Número de Documento</Label>
                  <Input
                    id="nro_documento"
                    value={formData.nro_documento}
                    onChange={(e) => setFormData({ ...formData, nro_documento: e.target.value })}
                    required
                    data-testid="socio-documento-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="socio-submit-button">
                  Agregar Socio
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
                placeholder="Buscar por nombre, documento o número de socio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-socios-input"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-500"></div>
              </div>
            ) : filteredSocios.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron socios</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">N° Socio</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Nombre</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Documento</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Fecha Registro</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSocios.map((socio) => (
                      <tr
                        key={socio.numero_socio}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        data-testid={`socio-row-${socio.numero_socio}`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">#{socio.numero_socio}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{socio.nombre}</td>
                        <td className="py-3 px-4 text-slate-600">{socio.nro_documento}</td>
                        <td className="py-3 px-4 text-slate-600 text-sm">
                          {format(new Date(socio.fecha_registro), 'dd MMM yyyy', { locale: es })}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/socios/${socio.numero_socio}`)}
                            data-testid={`view-socio-${socio.numero_socio}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
