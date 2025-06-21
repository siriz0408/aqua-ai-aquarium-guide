
CREATE OR REPLACE FUNCTION public.get_subscription_metrics()
RETURNS TABLE(
  total_users BIGINT,
  active_subscriptions BIGINT,
  expired_subscriptions BIGINT,
  expiring_soon BIGINT,
  never_subscribed BIGINT,
  revenue_at_risk NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_users,
    COUNT(*) FILTER (WHERE subscription_status = 'active' AND subscription_tier = 'pro')::BIGINT as active_subscriptions,
    COUNT(*) FILTER (WHERE subscription_status = 'expired')::BIGINT as expired_subscriptions,
    COUNT(*) FILTER (WHERE subscription_status = 'active' AND subscription_end_date < NOW() + INTERVAL '7 days')::BIGINT as expiring_soon,
    COUNT(*) FILTER (WHERE stripe_subscription_id IS NULL OR stripe_subscription_id = '')::BIGINT as never_subscribed,
    (COUNT(*) FILTER (WHERE subscription_status = 'active' AND subscription_end_date < NOW() + INTERVAL '7 days') * 4.99)::NUMERIC as revenue_at_risk
  FROM profiles;
END;
$$;

-- Also add a function to get expiring users details
CREATE OR REPLACE FUNCTION public.get_expiring_subscriptions()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  stripe_subscription_id TEXT,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  days_until_expiry INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.stripe_subscription_id,
    p.subscription_end_date,
    EXTRACT(DAY FROM (p.subscription_end_date - NOW()))::INTEGER as days_until_expiry
  FROM profiles p
  WHERE p.subscription_status = 'active'
  AND p.subscription_end_date < NOW() + INTERVAL '7 days'
  AND p.stripe_subscription_id IS NOT NULL
  ORDER BY p.subscription_end_date ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_subscription_metrics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_expiring_subscriptions TO anon, authenticated;
