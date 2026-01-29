-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'refunded');

-- Create enum for ticket tier
CREATE TYPE public.ticket_tier AS ENUM ('individual', 'vip', 'dupla');

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  tier ticket_tier NOT NULL,
  amount_cents INTEGER NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy for insert (anyone can create an order - guest checkout)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Create policy for select (orders can only be read by service role - for admin/backend)
CREATE POLICY "Service role can read all orders"
ON public.orders
FOR SELECT
USING (false);

-- Create policy for update (only service role can update - for webhook/backend)
CREATE POLICY "Service role can update orders"
ON public.orders
FOR UPDATE
USING (false);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();