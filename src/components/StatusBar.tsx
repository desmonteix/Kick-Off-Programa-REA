import { Users, Check } from 'lucide-react';

interface StatusBarProps {
  occupiedCount: number;
  availableCount: number;
  lastSync: Date | null;
  onSync: () => void;
}

function StatusBar({ occupiedCount, availableCount, lastSync }: StatusBarProps) {
  const total = occupiedCount + availableCount;
  const occupancyPercentage = total > 0 ? Math.round((occupiedCount / total) * 100) : 0;

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Hace unos segundos';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    return date.toLocaleTimeString('es-ES');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Asientos Ocupados</p>
            <p className="text-3xl font-bold text-red-600">{occupiedCount}</p>
          </div>
          <Users className="text-red-500" size={32} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Asientos Disponibles</p>
            <p className="text-3xl font-bold text-green-600">{availableCount}</p>
          </div>
          <Check className="text-green-500" size={32} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">Ocupación</p>
          <div className="mb-2">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${occupancyPercentage}%` }}
              ></div>
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600">{occupancyPercentage}%</p>
          <p className="text-xs text-gray-500 mt-1">
            Último sincronizado: {formatLastSync(lastSync)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
