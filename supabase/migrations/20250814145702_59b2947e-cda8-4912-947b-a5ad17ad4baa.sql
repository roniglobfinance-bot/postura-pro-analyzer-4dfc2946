-- Create auto-save table for draft assessments
CREATE TABLE assessment_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
  draft_data JSONB NOT NULL DEFAULT '{}',
  last_saved TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evaluation_id)
);

-- Enable RLS for assessment_drafts
ALTER TABLE assessment_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies for assessment_drafts
CREATE POLICY "Users can manage their own drafts" 
ON assessment_drafts 
FOR ALL 
USING (user_id = auth.uid());

-- Create feedback system
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for feedback
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback
CREATE POLICY "Users can create their own feedback" 
ON user_feedback 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own feedback" 
ON user_feedback 
FOR SELECT 
USING (user_id = auth.uid());

-- Teachers can view all feedback
CREATE POLICY "Teachers can view all feedback" 
ON user_feedback 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'teacher'
));

-- Create indexes for performance
CREATE INDEX idx_assessment_drafts_user ON assessment_drafts(user_id);
CREATE INDEX idx_assessment_drafts_evaluation ON assessment_drafts(evaluation_id);
CREATE INDEX idx_feedback_user ON user_feedback(user_id);
CREATE INDEX idx_feedback_status ON user_feedback(status);