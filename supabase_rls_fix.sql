-- Enable Row Level Security on the services table
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own services
CREATE POLICY "Users can only see their own services" ON public.services
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Policy: Users can only insert their own services
CREATE POLICY "Users can only insert their own services" ON public.services
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own services
CREATE POLICY "Users can only update their own services" ON public.services
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Policy: Users can only delete their own services
CREATE POLICY "Users can only delete their own services" ON public.services
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Also ensuring profiles table is secured as it is used in the dashboard
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own profile" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can only update their own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);