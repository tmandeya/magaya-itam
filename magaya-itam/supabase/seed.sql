-- =============================================================================
-- MAGAYA MINING ITAM - SEED DATA
-- Run after migration: psql -f supabase/seed.sql
-- =============================================================================

-- Organization
INSERT INTO organizations (id, name, slug) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Magaya Mining', 'magaya-mining');

-- Sites
INSERT INTO sites (id, org_id, site_code, name, city, state_region, country, timezone, status, manager_name, manager_email) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'SITE-0001', 'Magaya HQ', 'Harare', 'Harare', 'Zimbabwe', 'Africa/Harare', 'active', 'Tatenda Moyo', 't.moyo@magayamining.co.zw'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SITE-0002', 'Shamva Mine', 'Shamva', 'Mashonaland Central', 'Zimbabwe', 'Africa/Harare', 'active', 'Chipo Ndlovu', 'c.ndlovu@magayamining.co.zw'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'SITE-0003', 'Penhalonga Operations', 'Mutare', 'Manicaland', 'Zimbabwe', 'Africa/Harare', 'active', 'Farai Madziva', 'f.madziva@magayamining.co.zw'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'SITE-0004', 'Kwekwe Processing', 'Kwekwe', 'Midlands', 'Zimbabwe', 'Africa/Harare', 'maintenance', 'Rudo Chipanga', 'r.chipanga@magayamining.co.zw');

-- Departments
INSERT INTO departments (id, site_id, name, code) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'IT', 'IT'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Engineering', 'ENG'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Finance', 'FIN'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Operations', 'OPS'),
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'Admin', 'ADM'),
    ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'IT', 'IT'),
    ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'Security', 'SEC'),
    ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'Geology', 'GEO'),
    ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000004', 'Engineering', 'ENG');

-- Asset Types
INSERT INTO asset_types (org_id, category, name, code) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'hardware', 'Laptop', 'LPT'),
    ('a0000000-0000-0000-0000-000000000001', 'hardware', 'Desktop', 'DSK'),
    ('a0000000-0000-0000-0000-000000000001', 'hardware', 'Server', 'SRV'),
    ('a0000000-0000-0000-0000-000000000001', 'hardware', 'Smartphone', 'PHN'),
    ('a0000000-0000-0000-0000-000000000001', 'network', 'Switch', 'SWT'),
    ('a0000000-0000-0000-0000-000000000001', 'network', 'Router', 'RTR'),
    ('a0000000-0000-0000-0000-000000000001', 'network', 'Firewall', 'FWL'),
    ('a0000000-0000-0000-0000-000000000001', 'peripheral', 'Monitor', 'MNT'),
    ('a0000000-0000-0000-0000-000000000001', 'peripheral', 'Printer', 'PRN'),
    ('a0000000-0000-0000-0000-000000000001', 'peripheral', 'Camera', 'CAM');
