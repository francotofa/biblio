import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, Users, FileText, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Libros',
      value: stats?.total_libros || 0,
      subtitle: `${stats?.libros_disponibles || 0} disponibles`,
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Socios',
      value: stats?.total_socios || 0,
      subtitle: 'Socios registrados',
      icon: Users,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Préstamos Activos',
      value: stats?.prestamos_activos || 0,
      subtitle: 'En curso',
      icon: FileText,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50',
    },
    {
      title: 'Multas Pendientes',
      value: stats?.multas_pendientes || 0,
      subtitle: 'Por cobrar',
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Panel Principal</h2>
          <p className="text-slate-600 mt-1">Resumen general del sistema de biblioteca</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card
                  key={index}
                  className="bg-white/70 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-all duration-300"
                  data-testid={`stat-card-${card.title.toLowerCase().replace(' ', '-')}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">{card.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                      {card.value}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
