import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, AlertCircle, LayoutDashboard, LogOut, Library } from 'lucide-react';
import { Button } from './ui/button';

export const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Panel Principal' },
    { path: '/libros', icon: BookOpen, label: 'Libros' },
    { path: '/socios', icon: Users, label: 'Socios' },
    { path: '/prestamos', icon: FileText, label: 'Préstamos' },
    { path: '/multas', icon: AlertCircle, label: 'Multas' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl">
                <Library className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Sistema Biblioteca</h1>
                <p className="text-xs text-slate-500">Gestión integral</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700">{usuario.nombre}</p>
                <p className="text-xs text-slate-500">@{usuario.username}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="gap-2"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation */}
        <nav className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'outline'}
                    className={`gap-2 whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200'
                        : 'bg-white/70 backdrop-blur-sm hover:bg-white'
                    }`}
                    data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <main>{children}</main>
      </div>
    </div>
  );
};
