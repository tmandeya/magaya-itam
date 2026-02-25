-- =============================================================================
-- MAGAYA MINING IT ASSET MANAGEMENT SYSTEM
-- Supabase Migration: Initial Schema
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy text search

-- =============================================================================
-- ENUMS
-- =============================================================================
CREATE TYPE site_status AS ENUM ('active', 'inactive', 'maintenance');
CREATE TYPE user_role AS ENUM ('super_admin', 'site_admin', 'asset_manager', 'technician', 'auditor');
CREATE TYPE asset_category AS ENUM ('hardware', 'software', 'network', 'peripheral', 'license', 'component');
CREATE TYPE asset_status AS ENUM ('active', 'in_storage', 'deployed', 'under_repair', 'retired', 'disposed', 'sold', 'damaged', 'lost');
CREATE TYPE asset_condition AS ENUM ('new', 'excellent', 'good', 'fair', 'poor', 'non_functional');
CREATE TYPE lifecycle_stage AS ENUM ('procurement', 'deployment', 'maintenance', 'retirement', 'disposal');
CREATE TYPE risk_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE depreciation_method AS ENUM ('straight_line', 'double_declining', 'none');
CREATE TYPE transfer_status AS ENUM ('pending', 'approved', 'in_transit', 'received', 'completed', 'rejected', 'cancelled');
CREATE TYPE repair_status AS ENUM ('reported', 'diagnosed', 'awaiting_parts', 'in_progress', 'completed', 'cancelled');
CREATE TYPE repair_type AS ENUM ('in_house', 'external');
CREATE TYPE urgency_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'transfer', 'login', 'logout', 'export', 'alert');

-- =============================================================================
-- ORGANIZATIONS (Multi-Tenant Root)
-- =============================================================================
CREATE TABLE organizations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    logo_url    TEXT,
    settings    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SITES
-- =============================================================================
CREATE TABLE sites (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    site_code       TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    address         TEXT,
    city            TEXT,
    state_region    TEXT,
    country         TEXT,
    postal_code     TEXT,
    timezone        TEXT NOT NULL DEFAULT 'Africa/Harare',
    status          site_status NOT NULL DEFAULT 'active',
    logo_url        TEXT,
    manager_name    TEXT,
    manager_email   TEXT,
    manager_phone   TEXT,
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sites_org ON sites(org_id);
CREATE INDEX idx_sites_status ON sites(status);

-- Auto-generate site codes: SITE-0001, SITE-0002, etc.
CREATE SEQUENCE site_code_seq START 1;
CREATE OR REPLACE FUNCTION generate_site_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.site_code := 'SITE-' || LPAD(nextval('site_code_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_site_code
    BEFORE INSERT ON sites
    FOR EACH ROW
    WHEN (NEW.site_code IS NULL OR NEW.site_code = '')
    EXECUTE FUNCTION generate_site_code();

-- =============================================================================
-- DEPARTMENTS
-- =============================================================================
CREATE TABLE departments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id     UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    code        TEXT,
    head_user_id UUID,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id, name)
);

CREATE INDEX idx_departments_site ON departments(site_id);

-- =============================================================================
-- SECTIONS (Sub-locations within departments)
-- =============================================================================
CREATE TABLE sections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(department_id, name)
);

-- =============================================================================
-- USER PROFILES (extends Supabase Auth)
-- =============================================================================
CREATE TABLE profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    full_name   TEXT NOT NULL,
    avatar_url  TEXT,
    role        user_role NOT NULL DEFAULT 'technician',
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    phone       TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    last_login  TIMESTAMPTZ,
    settings    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_org ON profiles(org_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- =============================================================================
-- USER-SITE ACCESS (granular site permissions)
-- =============================================================================
CREATE TABLE user_site_access (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    site_id     UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    is_default  BOOLEAN DEFAULT FALSE,
    granted_at  TIMESTAMPTZ DEFAULT NOW(),
    granted_by  UUID REFERENCES profiles(id),
    UNIQUE(user_id, site_id)
);

CREATE INDEX idx_user_site_user ON user_site_access(user_id);
CREATE INDEX idx_user_site_site ON user_site_access(site_id);

-- =============================================================================
-- ASSET TYPES (configurable per category)
-- =============================================================================
CREATE TABLE asset_types (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category    asset_category NOT NULL,
    name        TEXT NOT NULL,
    code        TEXT NOT NULL,   -- short code for asset_code generation (e.g., LPT, DSK, SRV)
    icon        TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, category, code)
);

-- =============================================================================
-- ASSETS (Core Table)
-- =============================================================================
CREATE TABLE assets (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_code              TEXT NOT NULL UNIQUE,
    asset_tag               TEXT NOT NULL UNIQUE,
    category                asset_category NOT NULL,
    asset_type              TEXT NOT NULL,
    name                    TEXT NOT NULL,
    serial_number           TEXT NOT NULL,
    manufacturer            TEXT,
    model                   TEXT,
    specifications          JSONB DEFAULT '{}',
    hostname                TEXT,
    ip_address              INET,
    mac_address             MACADDR,
    antivirus               TEXT,
    operating_system        TEXT,
    purchase_date           DATE,
    purchase_order          TEXT,
    vendor                  TEXT,
    purchase_value          NUMERIC(12,2) NOT NULL DEFAULT 0,
    current_value           NUMERIC(12,2) NOT NULL DEFAULT 0,
    warranty_expiration     DATE,
    depreciation_method     depreciation_method DEFAULT 'straight_line',
    status                  asset_status NOT NULL DEFAULT 'active',
    condition               asset_condition NOT NULL DEFAULT 'new',
    site_id                 UUID NOT NULL REFERENCES sites(id),
    department_id           UUID REFERENCES departments(id),
    section                 TEXT,
    custodian_id            UUID REFERENCES profiles(id),
    previous_custodian_id   UUID REFERENCES profiles(id),
    assigned_date           TIMESTAMPTZ,
    lifecycle_stage         lifecycle_stage NOT NULL DEFAULT 'procurement',
    risk_level              risk_level DEFAULT 'medium',
    compliance_tags         TEXT[] DEFAULT '{}',
    disposal_method         TEXT,
    disposal_date           DATE,
    disposal_certificate    TEXT,
    insurance_policy        TEXT,
    lease_id                TEXT,
    lease_return_date       DATE,
    network_zone            TEXT,
    maintenance_schedule    JSONB,
    notes                   TEXT,
    custom_fields           JSONB DEFAULT '{}',
    created_by              UUID REFERENCES profiles(id),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_assets_org ON assets(org_id);
CREATE INDEX idx_assets_site ON assets(site_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_custodian ON assets(custodian_id);
CREATE INDEX idx_assets_department ON assets(department_id);
CREATE INDEX idx_assets_lifecycle ON assets(lifecycle_stage);
CREATE INDEX idx_assets_warranty ON assets(warranty_expiration);
CREATE INDEX idx_assets_serial ON assets(serial_number);
CREATE INDEX idx_assets_search ON assets USING GIN (
    (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(serial_number, '') || ' ' || COALESCE(asset_tag, '') || ' ' || COALESCE(manufacturer, '') || ' ' || COALESCE(model, '')))
);

-- Auto-generate asset codes: [SITE_CODE]-[TYPE_CODE]-[YYYY]-[#####]
CREATE SEQUENCE asset_code_seq START 1;
CREATE OR REPLACE FUNCTION generate_asset_code()
RETURNS TRIGGER AS $$
DECLARE
    v_site_code TEXT;
    v_type_code TEXT;
    v_year TEXT;
    v_seq TEXT;
BEGIN
    SELECT SPLIT_PART(site_code, '-', 2) INTO v_site_code FROM sites WHERE id = NEW.site_id;
    v_type_code := UPPER(LEFT(NEW.asset_type, 3));
    v_year := EXTRACT(YEAR FROM NOW())::TEXT;
    v_seq := LPAD(nextval('asset_code_seq')::TEXT, 5, '0');
    NEW.asset_code := v_site_code || '-' || v_type_code || '-' || v_year || '-' || v_seq;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_asset_code
    BEFORE INSERT ON assets
    FOR EACH ROW
    WHEN (NEW.asset_code IS NULL OR NEW.asset_code = '')
    EXECUTE FUNCTION generate_asset_code();

-- =============================================================================
-- ASSET RELATIONSHIPS (parent-child, bundles)
-- =============================================================================
CREATE TABLE asset_relationships (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    child_asset_id  UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    relationship    TEXT NOT NULL DEFAULT 'component', -- component, accessory, bundle, dependency
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_asset_id, child_asset_id)
);

-- =============================================================================
-- TRANSFERS
-- =============================================================================
CREATE TABLE transfers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    transfer_code       TEXT NOT NULL UNIQUE,
    from_site_id        UUID NOT NULL REFERENCES sites(id),
    to_site_id          UUID NOT NULL REFERENCES sites(id),
    status              transfer_status NOT NULL DEFAULT 'pending',
    reason              TEXT NOT NULL,
    notes               TEXT,
    carrier             TEXT,
    tracking_number     TEXT,
    expected_delivery   DATE,
    actual_delivery     DATE,
    departure_condition JSONB DEFAULT '{}',
    arrival_condition   JSONB DEFAULT '{}',
    departure_photos    TEXT[],
    arrival_photos      TEXT[],
    initiated_by        UUID NOT NULL REFERENCES profiles(id),
    approved_by         UUID REFERENCES profiles(id),
    received_by         UUID REFERENCES profiles(id),
    approved_at         TIMESTAMPTZ,
    shipped_at          TIMESTAMPTZ,
    received_at         TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transfers_org ON transfers(org_id);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_transfers_from ON transfers(from_site_id);
CREATE INDEX idx_transfers_to ON transfers(to_site_id);

CREATE SEQUENCE transfer_code_seq START 1;
CREATE OR REPLACE FUNCTION generate_transfer_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.transfer_code := 'TRF-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('transfer_code_seq')::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transfer_code
    BEFORE INSERT ON transfers
    FOR EACH ROW
    WHEN (NEW.transfer_code IS NULL OR NEW.transfer_code = '')
    EXECUTE FUNCTION generate_transfer_code();

-- =============================================================================
-- TRANSFER ITEMS (assets in a transfer)
-- =============================================================================
CREATE TABLE transfer_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_id UUID NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
    asset_id    UUID NOT NULL REFERENCES assets(id),
    UNIQUE(transfer_id, asset_id)
);

CREATE INDEX idx_transfer_items_transfer ON transfer_items(transfer_id);
CREATE INDEX idx_transfer_items_asset ON transfer_items(asset_id);

-- =============================================================================
-- REPAIRS
-- =============================================================================
CREATE TABLE repairs (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    repair_code             TEXT NOT NULL UNIQUE,
    asset_id                UUID NOT NULL REFERENCES assets(id),
    issue_description       TEXT NOT NULL,
    urgency                 urgency_level NOT NULL DEFAULT 'medium',
    repair_type             repair_type NOT NULL DEFAULT 'in_house',
    vendor                  TEXT,
    vendor_ticket_number    TEXT,
    status                  repair_status NOT NULL DEFAULT 'reported',
    diagnosis               TEXT,
    estimated_cost          NUMERIC(10,2) DEFAULT 0,
    actual_cost             NUMERIC(10,2),
    parts_cost              NUMERIC(10,2),
    labor_cost              NUMERIC(10,2),
    shipping_cost           NUMERIC(10,2),
    expected_completion     DATE,
    actual_completion       DATE,
    warranty_claim          BOOLEAN DEFAULT FALSE,
    replacement_asset_id    UUID REFERENCES assets(id),
    notes                   TEXT,
    photos                  TEXT[],
    reported_by             UUID NOT NULL REFERENCES profiles(id),
    assigned_to             UUID REFERENCES profiles(id),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_repairs_org ON repairs(org_id);
CREATE INDEX idx_repairs_asset ON repairs(asset_id);
CREATE INDEX idx_repairs_status ON repairs(status);

CREATE SEQUENCE repair_code_seq START 1;
CREATE OR REPLACE FUNCTION generate_repair_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.repair_code := 'RPR-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('repair_code_seq')::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_repair_code
    BEFORE INSERT ON repairs
    FOR EACH ROW
    WHEN (NEW.repair_code IS NULL OR NEW.repair_code = '')
    EXECUTE FUNCTION generate_repair_code();

-- =============================================================================
-- AUDIT LOG (Immutable)
-- =============================================================================
CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES profiles(id),
    action      audit_action NOT NULL,
    entity_type TEXT NOT NULL,       -- 'asset', 'transfer', 'repair', 'site', 'user'
    entity_id   UUID,
    changes     JSONB DEFAULT '{}',  -- { field: { old: x, new: y } }
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for performance on large datasets
CREATE INDEX idx_audit_org ON audit_log(org_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- Prevent updates/deletes on audit log (immutable)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log records cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_immutable_update
    BEFORE UPDATE ON audit_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER trg_audit_immutable_delete
    BEFORE DELETE ON audit_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

-- =============================================================================
-- ATTACHMENTS (generic file storage references)
-- =============================================================================
CREATE TABLE attachments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id   UUID NOT NULL,
    file_name   TEXT NOT NULL,
    file_url    TEXT NOT NULL,
    file_size   BIGINT DEFAULT 0,
    mime_type   TEXT,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);

-- =============================================================================
-- UTILITY: Updated_at trigger
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sites_updated BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_transfers_updated BEFORE UPDATE ON transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_repairs_updated BEFORE UPDATE ON repairs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_site_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Organization access: users can only see their own org
CREATE POLICY org_access ON organizations
    FOR ALL USING (id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Profile access: users can see profiles in their org
CREATE POLICY profile_read ON profiles
    FOR SELECT USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY profile_update_own ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Site access: users see sites they have access to
CREATE POLICY site_read ON sites
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
        AND (
            id IN (SELECT site_id FROM user_site_access WHERE user_id = auth.uid())
            OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
        )
    );

-- Site admin+ can manage sites
CREATE POLICY site_manage ON sites
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'site_admin'))
    );

-- Asset access: filtered by site access
CREATE POLICY asset_read ON assets
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
        AND (
            site_id IN (SELECT site_id FROM user_site_access WHERE user_id = auth.uid())
            OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
        )
    );

-- Asset managers+ can create/update assets
CREATE POLICY asset_manage ON assets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'site_admin', 'asset_manager'))
    );

-- Transfer access: participants can view
CREATE POLICY transfer_read ON transfers
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY transfer_manage ON transfers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'site_admin', 'asset_manager'))
    );

-- Repair access
CREATE POLICY repair_read ON repairs
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY repair_manage ON repairs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'site_admin', 'asset_manager', 'technician'))
    );

-- Audit log: org-level read for admins/auditors
CREATE POLICY audit_read ON audit_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'site_admin', 'auditor'))
    );

CREATE POLICY audit_insert ON audit_log
    FOR INSERT WITH CHECK (
        org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

-- Department access
CREATE POLICY dept_read ON departments
    FOR SELECT USING (
        site_id IN (SELECT site_id FROM user_site_access WHERE user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- User site access
CREATE POLICY usa_read ON user_site_access
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'site_admin'))
    );

-- Attachments
CREATE POLICY attach_read ON attachments
    FOR SELECT USING (TRUE);

CREATE POLICY attach_create ON attachments
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
    ('asset-photos', 'asset-photos', false),
    ('documents', 'documents', false),
    ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload asset photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'asset-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view asset photos from their org"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'asset-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- =============================================================================
-- VIEWS (Convenience queries)
-- =============================================================================

-- Asset summary with related data
CREATE OR REPLACE VIEW v_asset_details AS
SELECT
    a.*,
    s.name AS site_name,
    s.city AS site_city,
    d.name AS department_name,
    p.full_name AS custodian_name,
    p.email AS custodian_email,
    pp.full_name AS previous_custodian_name,
    o.name AS org_name
FROM assets a
LEFT JOIN sites s ON a.site_id = s.id
LEFT JOIN departments d ON a.department_id = d.id
LEFT JOIN profiles p ON a.custodian_id = p.id
LEFT JOIN profiles pp ON a.previous_custodian_id = pp.id
LEFT JOIN organizations o ON a.org_id = o.id;

-- Dashboard KPIs
CREATE OR REPLACE VIEW v_dashboard_kpis AS
SELECT
    org_id,
    COUNT(*) AS total_assets,
    SUM(current_value) AS total_value,
    COUNT(*) FILTER (WHERE status = 'active') AS active_count,
    COUNT(*) FILTER (WHERE status = 'deployed') AS deployed_count,
    COUNT(*) FILTER (WHERE status = 'under_repair') AS repair_count,
    COUNT(*) FILTER (WHERE status = 'in_storage') AS storage_count,
    COUNT(*) FILTER (WHERE warranty_expiration <= CURRENT_DATE + INTERVAL '30 days' AND warranty_expiration > CURRENT_DATE) AS warranty_expiring_30,
    COUNT(*) FILTER (WHERE warranty_expiration <= CURRENT_DATE + INTERVAL '60 days' AND warranty_expiration > CURRENT_DATE) AS warranty_expiring_60,
    COUNT(*) FILTER (WHERE warranty_expiration <= CURRENT_DATE + INTERVAL '90 days' AND warranty_expiration > CURRENT_DATE) AS warranty_expiring_90
FROM assets
GROUP BY org_id;

-- Transfer summary
CREATE OR REPLACE VIEW v_transfer_details AS
SELECT
    t.*,
    fs.name AS from_site_name,
    ts.name AS to_site_name,
    ip.full_name AS initiator_name,
    ap.full_name AS approver_name,
    rp.full_name AS receiver_name,
    (SELECT COUNT(*) FROM transfer_items ti WHERE ti.transfer_id = t.id) AS asset_count
FROM transfers t
LEFT JOIN sites fs ON t.from_site_id = fs.id
LEFT JOIN sites ts ON t.to_site_id = ts.id
LEFT JOIN profiles ip ON t.initiated_by = ip.id
LEFT JOIN profiles ap ON t.approved_by = ap.id
LEFT JOIN profiles rp ON t.received_by = rp.id;

-- Repair summary
CREATE OR REPLACE VIEW v_repair_details AS
SELECT
    r.*,
    a.name AS asset_name,
    a.asset_code,
    a.serial_number,
    s.name AS site_name,
    rp.full_name AS reporter_name,
    atp.full_name AS assigned_to_name
FROM repairs r
LEFT JOIN assets a ON r.asset_id = a.id
LEFT JOIN sites s ON a.site_id = s.id
LEFT JOIN profiles rp ON r.reported_by = rp.id
LEFT JOIN profiles atp ON r.assigned_to = atp.id;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Full-text search on assets
CREATE OR REPLACE FUNCTION search_assets(search_query TEXT, p_org_id UUID)
RETURNS SETOF v_asset_details AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM v_asset_details
    WHERE org_id = p_org_id
    AND (
        name ILIKE '%' || search_query || '%'
        OR serial_number ILIKE '%' || search_query || '%'
        OR asset_tag ILIKE '%' || search_query || '%'
        OR asset_code ILIKE '%' || search_query || '%'
        OR manufacturer ILIKE '%' || search_query || '%'
        OR model ILIKE '%' || search_query || '%'
        OR hostname ILIKE '%' || search_query || '%'
        OR custodian_name ILIKE '%' || search_query || '%'
    )
    ORDER BY updated_at DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate depreciated value
CREATE OR REPLACE FUNCTION calculate_depreciation(
    p_purchase_value NUMERIC,
    p_purchase_date DATE,
    p_method depreciation_method,
    p_useful_life_years INT DEFAULT 5
)
RETURNS NUMERIC AS $$
DECLARE
    v_age_years NUMERIC;
    v_annual_depreciation NUMERIC;
    v_current_value NUMERIC;
BEGIN
    IF p_method = 'none' OR p_purchase_date IS NULL THEN
        RETURN p_purchase_value;
    END IF;

    v_age_years := EXTRACT(EPOCH FROM (NOW() - p_purchase_date)) / (365.25 * 86400);

    IF p_method = 'straight_line' THEN
        v_annual_depreciation := p_purchase_value / p_useful_life_years;
        v_current_value := p_purchase_value - (v_annual_depreciation * v_age_years);
    ELSIF p_method = 'double_declining' THEN
        v_current_value := p_purchase_value * POWER(1 - (2.0 / p_useful_life_years), v_age_years);
    END IF;

    RETURN GREATEST(v_current_value, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-create audit log entry on asset changes
CREATE OR REPLACE FUNCTION log_asset_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_changes JSONB := '{}';
    v_action audit_action;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_action := 'create';
        v_changes := jsonb_build_object('new', row_to_json(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'update';
        -- Track changed fields
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            v_changes := v_changes || jsonb_build_object('status', jsonb_build_object('old', OLD.status, 'new', NEW.status));
        END IF;
        IF OLD.condition IS DISTINCT FROM NEW.condition THEN
            v_changes := v_changes || jsonb_build_object('condition', jsonb_build_object('old', OLD.condition, 'new', NEW.condition));
        END IF;
        IF OLD.site_id IS DISTINCT FROM NEW.site_id THEN
            v_action := 'transfer';
            v_changes := v_changes || jsonb_build_object('site_id', jsonb_build_object('old', OLD.site_id, 'new', NEW.site_id));
        END IF;
        IF OLD.custodian_id IS DISTINCT FROM NEW.custodian_id THEN
            v_changes := v_changes || jsonb_build_object('custodian_id', jsonb_build_object('old', OLD.custodian_id, 'new', NEW.custodian_id));
        END IF;
        IF OLD.current_value IS DISTINCT FROM NEW.current_value THEN
            v_changes := v_changes || jsonb_build_object('current_value', jsonb_build_object('old', OLD.current_value, 'new', NEW.current_value));
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'delete';
        v_changes := jsonb_build_object('deleted', row_to_json(OLD));
    END IF;

    INSERT INTO audit_log (org_id, user_id, action, entity_type, entity_id, changes)
    VALUES (
        COALESCE(NEW.org_id, OLD.org_id),
        auth.uid(),
        v_action,
        'asset',
        COALESCE(NEW.id, OLD.id),
        v_changes
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_asset_audit
    AFTER INSERT OR UPDATE OR DELETE ON assets
    FOR EACH ROW EXECUTE FUNCTION log_asset_changes();

-- =============================================================================
-- REALTIME (Enable for live updates)
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE assets;
ALTER PUBLICATION supabase_realtime ADD TABLE transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE repairs;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_log;
