interface SeatProps {
  seat: {
    id: string;
    seat_code: string;
    status: 'available' | 'occupied';
    participant_name: string | null;
  };
}

function Seat({ seat }: SeatProps) {
  const isOccupied = seat.status === 'occupied';

  return (
    <div className="group relative">
      <button
        className={`w-6 h-6 rounded-full transition-all transform hover:scale-110 cursor-default flex items-center justify-center text-[10px] font-bold
          ${isOccupied ? 'bg-red-500 text-transparent shadow-sm' : 'bg-green-500 text-transparent shadow-sm'}
        `}
        disabled
      >
        <span className="hidden opacity-0">{seat.seat_code}</span>
      </button>

      {isOccupied && seat.participant_name && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {seat.participant_name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
      
      {!isOccupied && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {seat.seat_code} Disponible
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

export default Seat;
