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

  // Renders seats from endCol down to startCol (descending = high numbers on the left)
  const renderSeatBlock = (rowLabel: string, startCol: number, endCol: number) => {
    const blockSeats = [];
    for (let c = endCol; c >= startCol; c--) {
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
      // Row N: N20, N19 (left) | empty middle | N3, N2, N1 (right)
      // Row N only goes up to seat 20 (no seat 21)
      return (
        <div key={rowLabel} className="flex items-center gap-4">
          <div className="w-4 text-center font-bold text-gray-400 text-xs">
            {rowLabel}
          </div>
          <div className="flex bg-white rounded-xl">
            {/* Left block: spacer for missing N21, then N20, N19 */}
            <div className="w-6 ml-2" />
            {renderSeatBlock(rowLabel, 19, 20)}

            {/* Aisle */}
            <div className="w-8" />

            {/* Empty Middle Block — spacer matching 15 seats (w-6=24px + gap-2=8px) */}
            <div style={{ width: `${15 * 24 + 14 * 8}px` }} />

            {/* Aisle */}
            <div className="w-8" />

            {/* Right block: N3, N2, N1 */}
            {renderSeatBlock(rowLabel, 1, 3)}
          </div>
          <div className="w-4 text-center font-bold text-gray-400 text-xs">
            {rowLabel}
          </div>
        </div>
      );
    }

    // Standard rows A-M: [21,20,19] | aisle | [18..4] | aisle | [3,2,1]
    return (
      <div key={rowLabel} className="flex items-center gap-4">
        <div className="w-4 text-center font-bold text-gray-400 text-xs">
          {rowLabel}
        </div>

        <div className="flex bg-white rounded-xl">
          {/* Left block: seats 21, 20, 19 */}
          {renderSeatBlock(rowLabel, 19, 21)}

          {/* Aisle */}
          <div className="w-8" />

          {/* Middle block: seats 18 → 4 */}
          {renderSeatBlock(rowLabel, 4, 18)}

          {/* Aisle */}
          <div className="w-8" />

          {/* Right block: seats 3, 2, 1 */}
          {renderSeatBlock(rowLabel, 1, 3)}
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
