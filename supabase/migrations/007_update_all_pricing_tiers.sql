-- Update constraints for pricing_tier to support all new granular tiers

DO $$
BEGIN
  -- 1. Update contracts table constraint
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'contracts'
  ) THEN
    -- Drop the old constraint if it exists
    EXECUTE 'ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_pricing_tier_check;';
    
    -- Add new comprehensive constraint
    EXECUTE '
      ALTER TABLE public.contracts 
      ADD CONSTRAINT contracts_pricing_tier_check 
      CHECK (pricing_tier IN (
        ''nda_draft_basic'', ''nda_draft_premium'', ''nda_review_basic'', ''nda_review_premium'',
        ''sla_draft_basic'', ''sla_draft_premium'', ''sla_review_basic'', ''sla_review_premium'',
        ''tech_msa_draft_basic'', ''tech_msa_draft_premium'', ''tech_msa_review_basic'', ''tech_msa_review_premium'',
        ''privacy_draft_basic'', ''privacy_draft_premium'',
        ''tnc_draft_basic'',
        ''nda_basic'', ''nda_premium'', ''sla_basic'', ''sla_premium'', ''tech_msa_basic'', ''tech_msa_premium'',
        ''nda'', ''sla'', ''tech_msa'',
        ''basic'', ''standard'', ''premium''
      ));
    ';
    RAISE NOTICE 'Updated contracts table check constraint.';
  ELSE
    RAISE NOTICE 'Contracts table does not exist. Skipping contracts update.';
  END IF;

  -- 2. Update pricing_tiers table constraint
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'pricing_tiers'
  ) THEN
    -- Drop the old constraint if it exists
    EXECUTE 'ALTER TABLE public.pricing_tiers DROP CONSTRAINT IF EXISTS pricing_tiers_tier_check;';
    
    -- Add new comprehensive constraint
    EXECUTE '
      ALTER TABLE public.pricing_tiers 
      ADD CONSTRAINT pricing_tiers_tier_check 
      CHECK (tier IN (
        ''nda_draft_basic'', ''nda_draft_premium'', ''nda_review_basic'', ''nda_review_premium'',
        ''sla_draft_basic'', ''sla_draft_premium'', ''sla_review_basic'', ''sla_review_premium'',
        ''tech_msa_draft_basic'', ''tech_msa_draft_premium'', ''tech_msa_review_basic'', ''tech_msa_review_premium'',
        ''privacy_draft_basic'', ''privacy_draft_premium'',
        ''tnc_draft_basic'',
        ''nda_basic'', ''nda_premium'', ''sla_basic'', ''sla_premium'', ''tech_msa_basic'', ''tech_msa_premium'',
        ''nda'', ''sla'', ''tech_msa'',
        ''basic'', ''standard'', ''premium''
      ));
    ';
    RAISE NOTICE 'Updated pricing_tiers table check constraint.';
  ELSE
    RAISE NOTICE 'Pricing_tiers table does not exist. Skipping pricing_tiers update.';
  END IF;
END $$;
