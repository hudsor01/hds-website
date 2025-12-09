-- Ensure conversion_funnel table exists with required analytics columns
CREATE TABLE IF NOT EXISTS public.conversion_funnel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funnel_name TEXT NOT NULL,
    step_name TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    session_id TEXT,
    user_id TEXT,
    page_path TEXT,
    properties JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    completed BOOLEAN DEFAULT false,
    time_to_complete INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversion_funnel' AND column_name = 'completed') THEN
        ALTER TABLE public.conversion_funnel ADD COLUMN completed BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversion_funnel' AND column_name = 'page_path') THEN
        ALTER TABLE public.conversion_funnel ADD COLUMN page_path TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversion_funnel' AND column_name = 'properties') THEN
        ALTER TABLE public.conversion_funnel ADD COLUMN properties JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversion_funnel' AND column_name = 'timestamp') THEN
        ALTER TABLE public.conversion_funnel ADD COLUMN timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_conversion_funnel_funnel_name ON public.conversion_funnel(funnel_name);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_completed_at ON public.conversion_funnel(completed_at);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_session_id ON public.conversion_funnel(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_user_id ON public.conversion_funnel(user_id);
