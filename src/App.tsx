import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import SeatGrid from './components/SeatGrid';
import StatusBar from './components/StatusBar';
import { fetchGoogleSheetsSeats } from './utils/googleSheets';

interface Seat {
  id: string;
  seat_code: string;
  status: 'available' | 'occupied';
  participant_name: string | null;
}

function App() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      await fetchSeats();
    };

    initializeApp();

    // Polling since WebSockets are unsupported by Google Sheets API natively
    const syncInterval = setInterval(fetchSeats, 15000);

    return () => clearInterval(syncInterval);
  }, []);

  async function fetchSeats() {
    try {
      const data = await fetchGoogleSheetsSeats();
      console.log('Google Sheets data received:', data);
      setSeats(data || []);
      setLastSync(new Date());
    } catch (error) {
      console.error('Error fetching seats from Google Sheets:', error);
    } finally {
      setLoading(false);
    }
  }

  // Total seats: 13 rows (A-M) × 21 seats + Row N (2+3) = 278
  const TOTAL_SEATS = 278;
  const occupiedCount = seats.filter((s) => s.status === 'occupied').length;
  const availableCount = TOTAL_SEATS - occupiedCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando asientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mapa de Asientos</h1>
          <p className="text-gray-600">Visualización en tiempo real de la disponibilidad de asientos</p>
        </div>

        <StatusBar
          occupiedCount={occupiedCount}
          availableCount={availableCount}
          lastSync={lastSync}
          onSync={fetchSeats}
        />

        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <SeatGrid seats={seats} />
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 bg-white rounded-lg p-4 shadow-sm mb-8">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>No Disponible</span>
            </div>
          </div>
          <button
            onClick={fetchSeats}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Sincronizar ahora
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
