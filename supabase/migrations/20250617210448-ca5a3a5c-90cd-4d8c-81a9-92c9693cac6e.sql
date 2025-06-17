
-- Add new columns to tasks table for detailed task information
ALTER TABLE tasks
ADD COLUMN detailed_instructions TEXT,
ADD COLUMN steps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN estimated_time VARCHAR(50),
ADD COLUMN difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN resources JSONB DEFAULT '[]'::jsonb,
ADD COLUMN tips TEXT[] DEFAULT '{}',
ADD COLUMN warnings TEXT[] DEFAULT '{}',
ADD COLUMN required_tools TEXT[] DEFAULT '{}';

-- Create index for better performance on JSONB columns
CREATE INDEX idx_tasks_steps ON tasks USING GIN (steps);
CREATE INDEX idx_tasks_resources ON tasks USING GIN (resources);
