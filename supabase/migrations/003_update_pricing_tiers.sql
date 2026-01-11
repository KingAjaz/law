-- Update pricing tier values in contracts table (only if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'contracts'
  ) THEN
    -- Update any existing data (basic -> nda, standard -> sla, premium -> tech_msa)
    EXECUTE '
      UPDATE public.contracts 
      SET pricing_tier = CASE 
        WHEN pricing_tier = ''basic'' THEN ''nda''
        WHEN pricing_tier = ''standard'' THEN ''sla''
        WHEN pricing_tier = ''premium'' THEN ''tech_msa''
        ELSE pricing_tier
      END
      WHERE pricing_tier IN (''basic'', ''standard'', ''premium'');
    ';
    
    -- Drop the old constraint if it exists
    EXECUTE 'ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_pricing_tier_check;';
    
    -- Add new constraint with updated values
    EXECUTE '
      ALTER TABLE public.contracts 
      ADD CONSTRAINT contracts_pricing_tier_check 
      CHECK (pricing_tier IN (''nda'', ''sla'', ''tech_msa''));
    ';
  ELSE
    RAISE NOTICE 'Contracts table does not exist. Skipping contracts update. Run migration 001_initial_schema.sql first.';
  END IF;
END $$;

-- Update pricing_tiers table data (only if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'pricing_tiers'
  ) THEN
    -- Update pricing tier records
    EXECUTE '
      UPDATE public.pricing_tiers 
      SET tier = ''nda'', name = ''NDA Review'', description = ''Non-Disclosure Agreement review with counterparty consultation'', price = 60000.00,
          features = ''["2 reviews", "30-min virtual review call with counterparty"]''::jsonb
      WHERE tier = ''basic'';
    ';
    
    EXECUTE '
      UPDATE public.pricing_tiers 
      SET tier = ''sla'', name = ''SLA and Service Agreement Reviews'', description = ''Service Level Agreement and service agreement review with consultation'', price = 100000.00,
          features = ''["2 reviews", "30-min virtual review call with counterparty"]''::jsonb
      WHERE tier = ''standard'';
    ';
    
    EXECUTE '
      UPDATE public.pricing_tiers 
      SET tier = ''tech_msa'', name = ''Tech MSAs and Order Forms'', description = ''Technology Master Service Agreements and order forms review'', price = 150000.00,
          features = ''["2 reviews", "1-hour virtual review call with counterparty"]''::jsonb
      WHERE tier = ''premium'';
    ';
    
    -- Drop the old constraint on pricing_tiers table
    EXECUTE 'ALTER TABLE public.pricing_tiers DROP CONSTRAINT IF EXISTS pricing_tiers_tier_check;';
    
    -- Add new constraint with updated values
    EXECUTE '
      ALTER TABLE public.pricing_tiers 
      ADD CONSTRAINT pricing_tiers_tier_check 
      CHECK (tier IN (''nda'', ''sla'', ''tech_msa''));
    ';
  ELSE
    RAISE NOTICE 'Pricing_tiers table does not exist. Skipping pricing_tiers update. Run migration 001_initial_schema.sql first.';
  END IF;
END $$;
