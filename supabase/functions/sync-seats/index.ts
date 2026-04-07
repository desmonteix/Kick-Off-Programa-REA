import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SheetRow {
  fecha?: string;
  hora?: string;
  nombre?: string;
  correo?: string;
  codigo_evento?: string;
  codigo_up?: string;
  registrado_por?: string;
  asiento?: string;
}

async function fetchGoogleSheetData(sheetId: string, sheetName: string, apiKey: string): Promise<SheetRow[]> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values || data.values.length < 2) {
      return [];
    }

    const headers = data.values[0];
    const rows: SheetRow[] = [];

    for (let i = 1; i < data.values.length; i++) {
      const row = data.values[i];
      const obj: SheetRow = {};

      headers.forEach((header: string, index: number) => {
        const key = header.toLowerCase().replace(/\s+/g, "_");
        obj[key as keyof SheetRow] = row[index];
      });

      if (obj.asiento) {
        rows.push(obj);
      }
    }

    return rows;
  } catch (error) {
    console.error("Error fetching Google Sheets:", error);
    return [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    let apiKey = Deno.env.get("GOOGLE_SHEETS_API_KEY");

    if (!apiKey && req.method === "POST") {
      try {
        const body = await req.json();
        apiKey = body.apiKey;
      } catch {
        // Body might not be JSON, that's ok
      }
    }

    const sheetId = "1FV3mWZXktl553AvO36KWx_G1QsFufbzJxOD9c31hFHM";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Google Sheets API key not configured. Please provide apiKey in request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const attendanceData = await fetchGoogleSheetData(sheetId, "Asistencias", apiKey);
    const exitData = await fetchGoogleSheetData(sheetId, "Salidas", apiKey);

    const attendanceMap = new Map<string, SheetRow>();
    const exitSet = new Set<string>();

    attendanceData.forEach((row) => {
      if (row.asiento && row.nombre) {
        attendanceMap.set(row.asiento, row);
      }
    });

    exitData.forEach((row) => {
      if (row.asiento && row.nombre) {
        exitSet.add(`${row.asiento}-${row.nombre}`);
      }
    });

    const allSeats = new Set<string>();
    attendanceMap.forEach((_, seat) => allSeats.add(seat));
    exitSet.forEach((entry) => {
      const seat = entry.split("-")[0];
      allSeats.add(seat);
    });

    for (const seatCode of allSeats) {
      const attendanceRecord = attendanceMap.get(seatCode);
      const hasCheckedOut = exitSet.has(`${seatCode}-${attendanceRecord?.nombre}`);

      const status = attendanceRecord && !hasCheckedOut ? "occupied" : "available";

      const { error } = await supabase
        .from("seats")
        .upsert({
          seat_code: seatCode,
          status,
          participant_name: attendanceRecord?.nombre || null,
          participant_email: attendanceRecord?.correo || null,
          check_in_time: attendanceRecord?.hora ? new Date(attendanceRecord.fecha + " " + attendanceRecord.hora).toISOString() : null,
          check_out_time: hasCheckedOut ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "seat_code" });

      if (error) {
        console.error(`Error upserting seat ${seatCode}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced_seats: allSeats.size,
        occupied_seats: Array.from(attendanceMap.keys()).filter(
          (seat) => !exitSet.has(`${seat}-${attendanceMap.get(seat)?.nombre}`)
        ).length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
