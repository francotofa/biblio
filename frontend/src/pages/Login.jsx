import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Library, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/70 backdrop-blur-md border-slate-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl w-fit">
            <Library className="w-12 h-12 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800">Sistema de Biblioteca</CardTitle>
            <CardDescription className="text-slate-600">Ingresa tus credenciales para continuar</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-white border-slate-200"
                  required
                  data-testid="login-username-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white border-slate-200"
                  required
                  data-testid="login-password-input"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-200"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-slate-600 text-center">
              <strong>Credenciales por defecto:</strong><br />
              Usuario: <code className="bg-white px-2 py-1 rounded">admin</code> | 
              Contraseña: <code className="bg-white px-2 py-1 rounded">admin123</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
