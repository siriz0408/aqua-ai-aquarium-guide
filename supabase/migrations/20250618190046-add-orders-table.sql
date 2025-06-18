
-- Create orders table to track one-time payment information
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  product_id TEXT,
  amount INTEGER,             -- Amount charged (in cents)
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  payment_type TEXT DEFAULT 'one_time', -- 'one_time', 'subscription'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to view their own orders
CREATE POLICY "select_own_orders" ON public.orders
  FOR SELECT
  USING (user_id = auth.uid());

-- Create policies for edge functions (trusted code) to insert and update orders
CREATE POLICY "insert_order" ON public.orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "update_order" ON public.orders
  FOR UPDATE
  USING (true);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
