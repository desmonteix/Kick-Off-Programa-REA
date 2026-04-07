interface SeatData {
  id: string;
  seat_code: string;
  status: 'available' | 'occupied';
  participant_name: string | null;
}

const SPREADSHEET_ID = '1FV3mWZXktl553AvO36KWx_G1QsFufbzJxOD9c31hFHM';

export async function fetchGoogleSheetsSeats(): Promise<SeatData[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || 'AIzaSyBn-G6uwAlCkOsGUW0D1FLsNiqn9SfHSv4';
  
  if (!apiKey) {
    throw new Error('No Google Sheets API Key provided.');
  }

  try {
    const urlAsistencias = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Asistencias!A:H?key=${apiKey}`;
    const urlSalidas = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Salidas!A:H?key=${apiKey}`;

    const [resAsistencias, resSalidas] = await Promise.all([
      fetch(urlAsistencias),
      fetch(urlSalidas)
    ]);

    if (!resAsistencias.ok || !resSalidas.ok) {
      throw new Error(`Error fetching Google Sheets: Asistencias=${resAsistencias.status}, Salidas=${resSalidas.status}`);
    }

    const dataAsistencias = await resAsistencias.json();
    const dataSalidas = await resSalidas.json();

    const rowsAsistencias: any[][] = dataAsistencias.values || [];
    const rowsSalidas: any[][] = dataSalidas.values || [];

    // Skip header row
    const asistencias = rowsAsistencias.slice(1);
    const salidas = rowsSalidas.slice(1);

    // Build a set of SEAT CODES that have been vacated (from Salidas column H)
    const salidasSeatSet = new Set<string>();
    // Also track person-level exits for rows without a seat code
    const salidasPersonSet = new Set<string>();
    
    for (const row of salidas) {
      const asiento = row[7] ? String(row[7]).trim().toUpperCase() : '';
      const codigoUp = row[5] ? String(row[5]).trim() : '';
      const nombre = row[2] ? String(row[2]).trim() : '';
      
      if (asiento) {
        // Primary: match by seat code
        salidasSeatSet.add(asiento);
      } else {
        // Fallback: if no seat in Salidas row, match by person
        if (codigoUp) salidasPersonSet.add(codigoUp);
        else if (nombre) salidasPersonSet.add(nombre);
      }
    }

    console.log('Salidas seats:', Array.from(salidasSeatSet));
    console.log('Salidas persons (no seat):', Array.from(salidasPersonSet));

    const seatsMap = new Map<string, SeatData>();

    for (let i = 0; i < asistencias.length; i++) {
      const row = asistencias[i];
      const nombre = row[2] ? String(row[2]).trim() : '';
      const codigoUp = row[5] ? String(row[5]).trim() : '';
      const asientoRaw = row[7] ? String(row[7]).trim().toUpperCase() : '';

      // If no seat assigned, skip
      if (!asientoRaw) continue;

      // Check if this specific SEAT was vacated
      const seatVacated = salidasSeatSet.has(asientoRaw);
      // Check if this person exited without a specific seat (fallback)
      const personExited = salidasPersonSet.has(codigoUp) || salidasPersonSet.has(nombre);

      if (!seatVacated && !personExited) {
        seatsMap.set(asientoRaw, {
          id: `seat-${asientoRaw}-${i}`,
          seat_code: asientoRaw,
          status: 'occupied',
          participant_name: nombre
        });
      }
    }

    console.log('Occupied seats:', Array.from(seatsMap.keys()));
    return Array.from(seatsMap.values());
  } catch (error) {
    console.error('Failed to sync direct from Google Sheets:', error);
    throw error;
  }
}

