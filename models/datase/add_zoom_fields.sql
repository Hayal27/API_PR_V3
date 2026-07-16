-- Add Zoom meeting fields to meetings table
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS zoom_meeting_id VARCHAR(255) AFTER meeting_link,
ADD COLUMN IF NOT EXISTS zoom_passcode VARCHAR(100) AFTER zoom_meeting_id;
