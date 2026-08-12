ALTER TABLE public.ppa_movement_analyses
  ADD COLUMN IF NOT EXISTS angle_trajectory jsonb,
  ADD COLUMN IF NOT EXISTS pattern_match text,
  ADD COLUMN IF NOT EXISTS protocol_key text;