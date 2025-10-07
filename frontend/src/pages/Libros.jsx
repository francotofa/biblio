import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Search, Eye, BookOpen } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

export const Libros = () => {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ isbn: '', titulo: '', autor: '', imagen_url: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchLibros();
  }, []);

  const fetchLibros = async () => {
    try {
      const response = await api.get('/libros');
      setLibros(response.data);
    } catch (error) {
      toast.error('Error al cargar libros');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/libros', formData);
      toast.success('Libro agregado exitosamente');
      setShowDialog(false);
      setFormData({ isbn: '', titulo: '', autor: '', imagen_url: '' });
      fetchLibros();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al agregar libro');
    }
  };

  const filteredLibros = libros.filter(
    (libro) =>
      libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Gestionar Libros</h2>
            <p className="text-slate-600 mt-1">Administra el catálogo de la biblioteca</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-200"
                data-testid="add-libro-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Libro
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Libro</DialogTitle>
                <DialogDescription>Completa los datos del libro</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    required
                    data-testid="libro-isbn-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                    data-testid="libro-titulo-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autor">Autor</Label>
                  <Input
                    id="autor"
                    value={formData.autor}
                    onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                    required
                    data-testid="libro-autor-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imagen_url">URL de Imagen (opcional)</Label>
                  <Input
                    id="imagen_url"
                    value={formData.imagen_url}
                    onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                    placeholder="https://ejemplo.com/portada.jpg"
                    data-testid="libro-imagen-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="libro-submit-button">
                  Agregar Libro
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
                placeholder="Buscar por título, autor o ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-libros-input"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-500"></div>
              </div>
            ) : filteredLibros.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron libros</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLibros.map((libro) => (
                  <Card
                    key={libro.isbn}
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
                    onClick={() => navigate(`/libros/${libro.isbn}`)}
                    data-testid={`libro-card-${libro.isbn}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-28 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex-shrink-0 overflow-hidden">
                          {libro.imagen_url ? (
                            <img src={libro.imagen_url} alt={libro.titulo} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 truncate" title={libro.titulo}>
                            {libro.titulo}
                          </h3>
                          <p className="text-sm text-slate-600 truncate" title={libro.autor}>
                            {libro.autor}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">ISBN: {libro.isbn}</p>
                          <div className="mt-2">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                libro.estado === 'disponible'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {libro.estado === 'disponible' ? 'Disponible' : 'Prestado'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/libros/${libro.isbn}`);
                        }}
                        data-testid={`view-libro-${libro.isbn}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
