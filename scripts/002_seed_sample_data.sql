-- Seed user types
INSERT INTO user_types (name, description) VALUES
  ('Admin', 'Administrator with full access'),
  ('Manager', 'Manager with limited admin access'),
  ('User', 'Standard user'),
  ('Guest', 'Guest user with minimal permissions')
ON CONFLICT (name) DO NOTHING;

-- Seed tags
INSERT INTO tags (name, description) VALUES
  ('VIP', 'Very important person'),
  ('Beta Tester', 'User participating in beta testing'),
  ('Early Adopter', 'Early adopter of the platform'),
  ('Premium', 'Premium subscription user'),
  ('Support', 'Support team member')
ON CONFLICT (name) DO NOTHING;

-- Seed notification schemas (example 4-level hierarchy)
INSERT INTO notification_schemas (level1, level2, level3, level4, description) VALUES
  ('Account', 'Security', 'Login', 'New Device', 'Notification when logging in from a new device'),
  ('Account', 'Security', 'Login', 'Suspicious Activity', 'Notification for suspicious login attempts'),
  ('Account', 'Security', 'Password', 'Change', 'Notification when password is changed'),
  ('Account', 'Security', 'Password', 'Reset', 'Notification when password reset is requested'),
  ('Account', 'Profile', 'Update', 'Email', 'Notification when email is updated'),
  ('Account', 'Profile', 'Update', 'Phone', 'Notification when phone number is updated'),
  ('Marketing', 'Promotions', 'Sales', 'Weekly', 'Weekly sales promotions'),
  ('Marketing', 'Promotions', 'Sales', 'Special', 'Special event sales'),
  ('Marketing', 'Newsletter', 'Weekly', 'Digest', 'Weekly newsletter digest'),
  ('Marketing', 'Newsletter', 'Monthly', 'Summary', 'Monthly summary newsletter'),
  ('System', 'Updates', 'Feature', 'New', 'New feature announcements'),
  ('System', 'Updates', 'Feature', 'Deprecated', 'Feature deprecation notices'),
  ('System', 'Maintenance', 'Scheduled', 'Downtime', 'Scheduled maintenance notifications'),
  ('System', 'Maintenance', 'Emergency', 'Outage', 'Emergency outage notifications')
ON CONFLICT (level1, level2, level3, level4) DO NOTHING;
