-- Local development seed for team expenses endpoint
-- Safe to re-run: records use fixed UUIDs and UPSERT semantics.

INSERT INTO organizations (id, name)
VALUES ('11111111-1111-4111-8111-111111111111', 'Test Organization')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO employees (
  id,
  organization_id,
  first_name,
  last_name,
  email,
  role,
  type,
  status
)
VALUES (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'Alex',
  'Tester',
  'alex.tester@example.com',
  'Engineer',
  'Contractor',
  'Active'
)
ON CONFLICT (id) DO UPDATE SET
  organization_id = EXCLUDED.organization_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  type = EXCLUDED.type,
  status = EXCLUDED.status;

INSERT INTO expenses (
  id,
  organization_id,
  employee_id,
  name,
  category,
  amount,
  description,
  attachment_url,
  expense_date,
  status,
  submitted_at
)
VALUES
(
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  'Flight to client site',
  'Travel',
  450,
  'Round trip flight for project kickoff',
  'https://example.com/receipts/flight.pdf',
  NOW() - INTERVAL '8 days',
  'pending',
  NOW() - INTERVAL '7 days'
),
(
  '44444444-4444-4444-8444-444444444444',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  'Hotel stay',
  'Accommodation',
  620,
  '3-night hotel booking',
  'https://example.com/receipts/hotel.pdf',
  NOW() - INTERVAL '6 days',
  'approved',
  NOW() - INTERVAL '5 days'
),
(
  '55555555-5555-4555-8555-555555555555',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  'Airport taxi',
  'Transport',
  75,
  'Taxi to and from airport',
  NULL,
  NOW() - INTERVAL '5 days',
  'rejected',
  NOW() - INTERVAL '4 days'
)
ON CONFLICT (id) DO UPDATE SET
  organization_id = EXCLUDED.organization_id,
  employee_id = EXCLUDED.employee_id,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  amount = EXCLUDED.amount,
  description = EXCLUDED.description,
  attachment_url = EXCLUDED.attachment_url,
  expense_date = EXCLUDED.expense_date,
  status = EXCLUDED.status,
  submitted_at = EXCLUDED.submitted_at,
  updated_at = NOW();
