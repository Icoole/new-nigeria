CREATE TABLE public.ec8a_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id TEXT NOT NULL,
  pu_id TEXT NOT NULL,
  pu_code TEXT,
  pu_name TEXT,
  lga TEXT,
  ward TEXT,
  sheet_url TEXT NOT NULL,
  accredited INTEGER,
  valid_votes INTEGER,
  rejected_votes INTEGER,
  total_votes INTEGER,
  votes JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC,
  status TEXT NOT NULL DEFAULT 'read',
  note TEXT,
  sheet_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (election_id, pu_id, sheet_url)
);

CREATE INDEX ec8a_readings_election_idx ON public.ec8a_readings (election_id, created_at DESC);

GRANT SELECT ON public.ec8a_readings TO anon;
GRANT SELECT ON public.ec8a_readings TO authenticated;
GRANT ALL ON public.ec8a_readings TO service_role;

ALTER TABLE public.ec8a_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Readings are public" ON public.ec8a_readings FOR SELECT USING (true);