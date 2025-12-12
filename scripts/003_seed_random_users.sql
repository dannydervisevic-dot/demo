-- Seed random users with various types and tags
-- This script adds 20 sample users with different combinations of user types and tags

INSERT INTO users (name, email, phone, user_type_id)
VALUES 
  ('Sarah Johnson', 'sarah.johnson@example.com', '+1-555-0101', (SELECT id FROM user_types WHERE name = 'Admin' LIMIT 1)),
  ('Michael Chen', 'michael.chen@example.com', '+1-555-0102', (SELECT id FROM user_types WHERE name = 'Manager' LIMIT 1)),
  ('Emily Rodriguez', 'emily.rodriguez@example.com', '+1-555-0103', (SELECT id FROM user_types WHERE name = 'User' LIMIT 1)),
  ('David Kim', 'david.kim@example.com', '+1-555-0104', (SELECT id FROM user_types WHERE name = 'User' LIMIT 1)),
  ('Jessica Martinez', 'jessica.martinez@example.com', '+1-555-0105', (SELECT id FROM user_types WHERE name = 'Manager' LIMIT 1)),
  ('James Wilson', 'james.wilson@example.com', '+1-555-0106', (SELECT id FROM user_types WHERE name = 'User' LIMIT 1)),
  ('Amanda Taylor', 'amanda.taylor@example.com', '+1-555-0107', (SELECT id FROM user_types WHERE name = 'Guest' LIMIT 1)),
  ('Christopher Brown', 'chris.brown@example.com', '+1-555-0108', (SELECT id FROM user_types WHERE name = 'User' LIMIT 1)),
  ('Lauren Anderson', 'lauren.anderson@example.com', '+1-555-0109', (SELECT id FROM user_types WHERE name = 'Manager' LIMIT 1)),
  ('Daniel Garcia', 'daniel.garcia@example.com', '+1-555-0110', (SELECT id FROM user_types WHERE name = 'User' LIMIT 1)),
  ('Sophia Lee', 'sophia.lee@example.com', '+1-555-0111', (SELECT id FROM user_types WHERE name = 'User' LIMIT 1)),
  ('Robert White', 'robert.white@example.com', '+1-555-0112', (SELECT id FROM user_types WHERE name = 'Guest' LIMIT 1)),
  ('Olivia Thomas', 'olivia.thomas@example.com', '+1-555-0113', (SELECT id FROM user_types WHERE name = 'User' LIMIT 1)),
  ('William Jackson', 'william.jackson@example.com', '+1-555-0114', (SELECT id FROM user_types WHERE name = 'Manager' LIMIT 1)),
  ('Ava Harris', 'ava.harris@example.com', '+1-555-0115', (SELECT id FROM user_types WHERE name = 'User' LIMIT 1)),
  ('Matthew Clark', 'matthew.clark@example.com', '+1-555-0116', (SELECT id FROM user_types WHERE name = 'User' LIMIT 1)),
  ('Isabella Lewis', 'isabella.lewis@example.com', '+1-555-0117', (SELECT id FROM user_types WHERE name = 'Guest' LIMIT 1)),
  ('Joshua Robinson', 'joshua.robinson@example.com', '+1-555-0118', (SELECT id FROM user_types WHERE name = 'User' LIMIT 1)),
  ('Mia Walker', 'mia.walker@example.com', '+1-555-0119', (SELECT id FROM user_types WHERE name = 'Manager' LIMIT 1)),
  ('Ethan Hall', 'ethan.hall@example.com', '+1-555-0120', (SELECT id FROM user_types WHERE name = 'User' LIMIT 1));

-- Assign VIP tags to some users
INSERT INTO user_tags (user_id, tag_id)
SELECT u.id, t.id
FROM users u
CROSS JOIN tags t
WHERE t.name = 'VIP'
AND u.email IN (
  'sarah.johnson@example.com',
  'michael.chen@example.com',
  'jessica.martinez@example.com',
  'lauren.anderson@example.com',
  'mia.walker@example.com'
);

-- Assign Beta Tester tags to some users
INSERT INTO user_tags (user_id, tag_id)
SELECT u.id, t.id
FROM users u
CROSS JOIN tags t
WHERE t.name = 'Beta Tester'
AND u.email IN (
  'emily.rodriguez@example.com',
  'david.kim@example.com',
  'sophia.lee@example.com',
  'olivia.thomas@example.com',
  'matthew.clark@example.com',
  'ethan.hall@example.com'
);

-- Assign Premium Member tags to some users
INSERT INTO user_tags (user_id, tag_id)
SELECT u.id, t.id
FROM users u
CROSS JOIN tags t
WHERE t.name = 'Premium Member'
AND u.email IN (
  'sarah.johnson@example.com',
  'michael.chen@example.com',
  'james.wilson@example.com',
  'christopher.brown@example.com',
  'william.jackson@example.com',
  'joshua.robinson@example.com'
);

-- Assign Early Adopter tags to some users (some users will have multiple tags)
INSERT INTO user_tags (user_id, tag_id)
SELECT u.id, t.id
FROM users u
CROSS JOIN tags t
WHERE t.name = 'Early Adopter'
AND u.email IN (
  'lauren.anderson@example.com',
  'daniel.garcia@example.com',
  'ava.harris@example.com',
  'mia.walker@example.com'
);
