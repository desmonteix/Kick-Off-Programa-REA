import Seat from './Seat';

interface SeatData {
  id: string;
  seat_code: string;
  status: 'available' | 'occupied';
  participant_name: string | null;
}

interface SeatGridProps {
  seats: SeatData[];
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

function SeatGrid({ seats }: SeatGridProps) {
  // Build a lookup map keyed by uppercase seat code
  const seatMap = new Map<string, SeatData>();
  seats.forEach(s => {
    seatMap.set(s.seat_code.toUpperCase(), s);
  });

  const renderSeatBlock = (rowLabel: string, startCol: number, endCol: number) => {
    const blockSeats = [];
    for (let c = startCol; c <= endCol; c++) {
      const code = `${rowLabel}${c}`;
      const found = seatMap.get(code);
      const seat: SeatData = found || {
        id: `dummy-${code}`,
        seat_code: code,
        status: 'available' as const,
        participant_name: null
      };
      blockSeats.push(<Seat key={code} seat={seat} />);
    }
    return <div className="flex gap-2">{blockSeats}</div>;
  };


  const renderRow = (rowLabel: string) => {
    if (rowLabel === 'N') {
      // Row N: seats N1, N2, N3 (left), N19, N20 (right)
      return (
        <div key={rowLabel} className="flex items-center gap-4">
          <div className="w-4 text-center font-bold text-gray-400 text-xs">
            {rowLabel}
          </div>
          <div className="flex bg-white rounded-xl">
            {/* Left Block: N1-N3 */}
            {renderSeatBlock(rowLabel, 1, 3)}
            
            {/* Aisle */}
            <div className="w-8" />
            
            {/* Empty Middle Block - spacer matching 15 seats (w-6=24px each + gap-2=8px) */}
            <div style={{ width: `${15 * 24 + 14 * 8}px` }} />

            {/* Aisle */}
            <div className="w-8" />
            
            {/* Right Block: N19-N20 */}
            {renderSeatBlock(rowLabel, 19, 20)}
            {/* Spacer for missing seat 21 to keep alignment */}
            <div className="w-6 ml-2" />
          </div>
          <div className="w-4 text-center font-bold text-gray-400 text-xs">
            {rowLabel}
          </div>
        </div>
      );
    }

    // Standard rows A-M: seats 1-3 (left), 4-18 (middle), 19-21 (right)
    // Left = seat 1, Right = seat 21
    return (
      <div key={rowLabel} className="flex items-center gap-4">
        <div className="w-4 text-center font-bold text-gray-400 text-xs">
          {rowLabel}
        </div>

        <div className="flex bg-white rounded-xl">
          {/* Left Block: seats 1-3 */}
          {renderSeatBlock(rowLabel, 1, 3)}
          
          {/* Aisle */}
          <div className="w-8" />
          
          {/* Middle Block: seats 4-18 */}
          {renderSeatBlock(rowLabel, 4, 18)}

          {/* Aisle */}
          <div className="w-8" />
          
          {/* Right Block: seats 19-21 */}
          {renderSeatBlock(rowLabel, 19, 21)}
        </div>

        <div className="w-4 text-center font-bold text-gray-400 text-xs">
          {rowLabel}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Stage / Escenario */}
      <div className="w-[800px] max-w-full h-16 bg-teal-100/50 flex items-center justify-center rounded-lg mb-8">
        <span className="text-teal-600/60 font-bold text-xl tracking-widest uppercase">Escenario</span>
      </div>

      <div className="flex flex-col space-y-3">
        {ROWS.map(rowLabel => renderRow(rowLabel))}
      </div>
    </div>
  );
}

export default SeatGrid;
