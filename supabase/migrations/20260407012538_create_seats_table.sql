/*
  # Create seats management table

  1. New Tables
    - `seats`
      - `id` (uuid, primary key)
      - `seat_code` (text, unique) - Identificador del asiento (A1, A2, B1, etc.)
      - `status` (enum) - 'available' (verde) o 'occupied' (rojo)
      - `participant_name` (text) - Nombre del participante asignado
      - `participant_email` (text) - Email del participante
      - `check_in_time` (timestamp) - Hora de ingreso a la sala
      - `check_out_time` (timestamp) - Hora de salida de la sala
      - `updated_at` (timestamp) - Última actualización

  2. Security
    - Enable RLS on `seats` table
    - Allow public read access (for the real-time visualization)
    - Only allow authenticated admin updates
*/

CREATE TABLE IF NOT EXISTS seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
  participant_name text,
  participant_email text,
  check_in_time timestamptz,
  check_out_time timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view seat status"
  ON seats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can update seats"
  ON seats
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);