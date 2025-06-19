
-- Add the new advanced water parameters to the water_test_logs table
-- These columns already exist in the table, but let's ensure they have proper constraints

-- Update the water_test_logs table with comments and better constraints
COMMENT ON COLUMN water_test_logs.alkalinity IS 'Alkalinity in dKH (ideal range: 7-12 dKH)';
COMMENT ON COLUMN water_test_logs.calcium IS 'Calcium in ppm (ideal range: 380-450 ppm)';
COMMENT ON COLUMN water_test_logs.magnesium IS 'Magnesium in ppm (ideal range: 1250-1350 ppm)';
COMMENT ON COLUMN water_test_logs.phosphate IS 'Phosphate in ppm (ideal range: 0.03-0.10 ppm)';

-- Add check constraints for parameter ranges
ALTER TABLE water_test_logs 
ADD CONSTRAINT alkalinity_range CHECK (alkalinity IS NULL OR (alkalinity >= 0 AND alkalinity <= 20));

ALTER TABLE water_test_logs 
ADD CONSTRAINT calcium_range CHECK (calcium IS NULL OR (calcium >= 0 AND calcium <= 600));

ALTER TABLE water_test_logs 
ADD CONSTRAINT magnesium_range CHECK (magnesium IS NULL OR (magnesium >= 0 AND magnesium <= 2000));

ALTER TABLE water_test_logs 
ADD CONSTRAINT phosphate_range CHECK (phosphate IS NULL OR (phosphate >= 0 AND phosphate <= 1));
