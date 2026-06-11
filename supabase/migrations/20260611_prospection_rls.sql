-- Enable RLS on prospection tables: leads and campaigns contain personal data
-- (names, emails, phone numbers, addresses) and were previously readable by
-- any authenticated user via the anon key. All access goes through
-- /api/admin/prospection* routes using the service role, which bypasses RLS,
-- so no policies are needed for normal operation.

ALTER TABLE prospection_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospection_campaigns ENABLE ROW LEVEL SECURITY;
