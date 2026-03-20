"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase-client";

// ==================== TYPES ====================
interface Organization { id: string; name: string; slug: string; logo_url: string | null; settings: Record<string, unknown>; }
interface Site { id: string; org_id: string; site_code: string; name: string; address: string | null; city: string | null; state_region: string | null; country: string | null; status: "active" | "inactive" | "maintenance"; manager_name: string | null; manager_email: string | null; manager_phone: string | null; created_at: string; asset_count?: number; department_count?: number; }
interface Department { id: string; site_id: string; name: string; code: string | null; created_at: string; }
interface AssetType { id: string; org_id: string; category: string; name: string; code: string; icon: string | null; is_active: boolean; }
interface Asset { id: string; org_id: string; asset_code: string; asset_tag: string; category: string; asset_type: string; name: string; serial_number: string; manufacturer: string | null; model: string | null; hostname: string | null; ip_address: string | null; mac_address: string | null; operating_system: string | null; purchase_date: string | null; purchase_value: number; current_value: number; warranty_expiration: string | null; status: string; condition: string; site_id: string; department_id: string | null; custodian_id: string | null; lifecycle_stage: string; risk_level: string | null; notes: string | null; created_at: string; site?: Site; department?: Department; custodian?: Profile; }
interface Transfer { id: string; org_id: string; transfer_code: string; from_site_id: string; to_site_id: string; status: string; reason: string; notes: string | null; carrier: string | null; expected_delivery: string | null; created_at: string; from_site?: Site; to_site?: Site; items?: TransferItem[]; }
interface TransferItem { id: string; transfer_id: string; asset_id: string; asset?: Asset; }
interface Repair { id: string; org_id: string; repair_code: string; asset_id: string; issue_description: string; urgency: string; repair_type: string; vendor: string | null; status: string; diagnosis: string | null; estimated_cost: number | null; actual_cost: number | null; expected_completion: string | null; created_at: string; asset?: Asset; }
interface Profile { id: string; email: string; full_name: string; avatar_url: string | null; role: string; org_id: string; phone: string | null; is_active: boolean; }
interface AuditEntry { id: string; org_id: string; user_id: string | null; action: string; entity_type: string; entity_id: string | null; changes: Record<string, unknown>; ip_address: string | null; created_at: string; user?: Profile; }

// ==================== CONSTANTS ====================
const GOLD = "#D4AF37";
const BG = "#0A0A0A";
const CARD_BG = "#FFFFFF";
const SIDEBAR_BG = "#0A0A0A";
const TEXT = "#0A0A0A";
const TEXT_MUTED = "#737373";
const BORDER = "#e5e5e5";

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e", deployed: "#3b82f6", in_storage: "#8b5cf6", under_repair: "#f59e0b",
  retired: "#6b7280", disposed: "#dc2626", sold: "#ef4444", damaged: "#ef4444", lost: "#dc2626",
  pending: "#f59e0b", approved: "#3b82f6", in_transit: "#8b5cf6", received: "#22c55e",
  completed: "#22c55e", rejected: "#ef4444", cancelled: "#6b7280",
  reported: "#f59e0b", diagnosed: "#3b82f6", awaiting_parts: "#8b5cf6", in_progress: "#3b82f6",
  inactive: "#6b7280", maintenance: "#f59e0b",
};

const CONDITION_COLORS: Record<string, string> = {
  new: "#22c55e", excellent: "#3b82f6", good: "#8b5cf6", fair: "#f59e0b", poor: "#ef4444", non_functional: "#dc2626",
};

const RISK_COLORS: Record<string, string> = {
  critical: "#dc2626", high: "#ef4444", medium: "#f59e0b", low: "#22c55e",
};

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "📊", section: "MAIN" },
  { key: "assets", label: "Asset Register", icon: "💻", section: "MAIN" },
  { key: "transfers", label: "Transfers", icon: "🔄", section: "MAIN" },
  { key: "repairs", label: "Repairs", icon: "🔧", section: "MAIN" },
  { key: "sites", label: "Sites", icon: "📍", section: "MANAGEMENT" },
  { key: "users", label: "Users & Roles", icon: "👥", section: "MANAGEMENT" },
  { key: "reports", label: "Reports", icon: "📈", section: "MANAGEMENT" },
  { key: "audit", label: "Audit Trail", icon: "📋", section: "MANAGEMENT" },
  { key: "settings", label: "Settings", icon: "⚙️", section: "SYSTEM" },
];

// ==================== STYLES ====================
const styles = {
  container: { display: "flex", minHeight: "100vh", background: "#f5f5f4", fontFamily: "'Inter', -apple-system, sans-serif" } as React.CSSProperties,
  sidebar: { width: 240, background: SIDEBAR_BG, color: "#fff", display: "flex", flexDirection: "column" as const, position: "fixed" as const, top: 0, left: 0, bottom: 0, zIndex: 50 },
  logo: { padding: "24px 20px", borderBottom: "1px solid #222" },
  logoTitle: { fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 },
  logoSub: { fontSize: 11, color: GOLD, textTransform: "uppercase" as const, letterSpacing: 2, marginTop: 2 },
  navSection: { fontSize: 10, color: "#555", textTransform: "uppercase" as const, letterSpacing: 2, padding: "16px 20px 8px", fontWeight: 600 },
  navItem: (active: boolean) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", cursor: "pointer", background: active ? "#1a1a1a" : "transparent", color: active ? "#fff" : "#888", fontSize: 13, fontWeight: active ? 600 : 400, borderLeft: active ? `3px solid ${GOLD}` : "3px solid transparent", transition: "all 0.15s" }),
  main: { flex: 1, marginLeft: 240, padding: "24px 32px" } as React.CSSProperties,
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: TEXT, margin: 0 },
  breadcrumb: { fontSize: 12, color: TEXT_MUTED, marginTop: 4 },
  card: { background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 24, marginBottom: 16 },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  stat: { background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 20 },
  statValue: { fontSize: 28, fontWeight: 800, color: TEXT, margin: 0 },
  statLabel: { fontSize: 11, color: TEXT_MUTED, textTransform: "uppercase" as const, letterSpacing: 1.5, marginTop: 4 },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { textAlign: "left" as const, padding: "10px 12px", fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 1.5, color: TEXT_MUTED, borderBottom: `2px solid ${BORDER}`, fontWeight: 600 },
  td: { padding: "12px", borderBottom: `1px solid ${BORDER}`, color: TEXT },
  btn: (variant: "primary" | "secondary" = "primary") => ({ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: variant === "primary" ? "none" : `1px solid ${BORDER}`, background: variant === "primary" ? GOLD : "transparent", color: variant === "primary" ? BG : TEXT }),
  badge: (color: string) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}15`, color }),
  input: { width: "100%", padding: "10px 14px", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" } as React.CSSProperties,
  select: { width: "100%", padding: "10px 14px", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" } as React.CSSProperties,
  label: { display: "block", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 1.5, color: TEXT_MUTED, marginBottom: 6, fontWeight: 600 } as React.CSSProperties,
  formGroup: { marginBottom: 16 },
  emptyState: { textAlign: "center" as const, padding: "60px 20px", color: TEXT_MUTED },
  loading: { textAlign: "center" as const, padding: "40px", color: TEXT_MUTED, fontSize: 14 },
  modal: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modalContent: { background: "#fff", borderRadius: 16, padding: 32, width: 560, maxHeight: "85vh", overflowY: "auto" as const },
};

// ==================== BADGE COMPONENTS ====================
const StatusBadge = ({ status }: { status: string }) => {
  const color = STATUS_COLORS[status] || "#6b7280";
  const label = status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return <span style={styles.badge(color)}><span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />{label}</span>;
};

const ConditionBadge = ({ condition }: { condition: string }) => {
  const color = CONDITION_COLORS[condition] || "#6b7280";
  const label = condition.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return <span style={styles.badge(color)}>{label}</span>;
};

const RiskBadge = ({ risk }: { risk: string }) => {
  const color = RISK_COLORS[risk] || "#6b7280";
  const label = risk.replace(/\b\w/g, c => c.toUpperCase());
  return <span style={{ color, fontWeight: 700, fontSize: 13 }}>{label}</span>;
};

// ==================== MODAL ====================
const Modal = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: TEXT_MUTED }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function ITAMApp() {
  const [page, setPage] = useState("dashboard");
  const [org, setOrg] = useState<Organization | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteFilter, setSiteFilter] = useState("all");

  // ==================== DATA FETCHING ====================
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [orgRes, sitesRes, deptRes, typesRes, assetsRes, transfersRes, repairsRes, profilesRes, auditRes] = await Promise.all([
        supabase.from("organizations").select("*").limit(1).single(),
        supabase.from("sites").select("*").order("name"),
        supabase.from("departments").select("*").order("name"),
        supabase.from("asset_types").select("*").order("category, name"),
        supabase.from("assets").select("*, site:sites(id, name, site_code), department:departments(id, name), custodian:profiles!assets_custodian_id_fkey(id, full_name, email)").order("created_at", { ascending: false }),
        supabase.from("transfers").select("*, from_site:sites!transfers_from_site_id_fkey(id, name), to_site:sites!transfers_to_site_id_fkey(id, name)").order("created_at", { ascending: false }),
        supabase.from("repairs").select("*, asset:assets(id, name, asset_code, asset_tag)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("full_name"),
        supabase.from("audit_log").select("*, user:profiles(id, full_name)").order("created_at", { ascending: false }).limit(100),
      ]);

      if (orgRes.data) setOrg(orgRes.data);
      if (sitesRes.data) setSites(sitesRes.data);
      if (deptRes.data) setDepartments(deptRes.data);
      if (typesRes.data) setAssetTypes(typesRes.data);
      if (assetsRes.data) setAssets(assetsRes.data as Asset[]);
      if (transfersRes.data) setTransfers(transfersRes.data as Transfer[]);
      if (repairsRes.data) setRepairs(repairsRes.data as Repair[]);
      if (profilesRes.data) setProfiles(profilesRes.data);
      if (auditRes.data) setAuditLog(auditRes.data as AuditEntry[]);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ==================== COMPUTED ====================
  const siteDeptCount = (siteId: string) => departments.filter(d => d.site_id === siteId).length;
  const siteAssetCount = (siteId: string) => assets.filter(a => a.site_id === siteId).length;
  const filteredAssets = siteFilter === "all" ? assets : assets.filter(a => a.site_id === siteFilter);
  const activeTransfers = transfers.filter(t => !["completed", "cancelled", "rejected"].includes(t.status));
  const activeRepairs = repairs.filter(r => !["completed", "cancelled"].includes(r.status));

  const stats = {
    totalAssets: assets.length,
    activeAssets: assets.filter(a => ["active", "deployed"].includes(a.status)).length,
    totalValue: assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0),
    underRepair: assets.filter(a => a.status === "under_repair").length,
    pendingTransfers: activeTransfers.length,
    openRepairs: activeRepairs.length,
    totalSites: sites.filter(s => s.status === "active").length,
    totalUsers: profiles.filter(p => p.is_active).length,
  };

  // ==================== DASHBOARD ====================
  const DashboardPage = () => (
    <>
      <div style={styles.statGrid}>
        {[
          { label: "Total Assets", value: stats.totalAssets, icon: "💻" },
          { label: "Active / Deployed", value: stats.activeAssets, icon: "✅" },
          { label: "Portfolio Value", value: `$${stats.totalValue.toLocaleString()}`, icon: "💰" },
          { label: "Active Sites", value: stats.totalSites, icon: "📍" },
        ].map((s, i) => (
          <div key={i} style={styles.stat}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <p style={styles.statValue}>{s.value}</p>
            <p style={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={styles.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: TEXT }}>Open Transfers ({activeTransfers.length})</h3>
          {activeTransfers.length === 0 ? (
            <p style={{ color: TEXT_MUTED, fontSize: 13 }}>No active transfers</p>
          ) : activeTransfers.slice(0, 5).map(t => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.transfer_code}</div>
                <div style={{ fontSize: 12, color: TEXT_MUTED }}>{t.from_site?.name} → {t.to_site?.name}</div>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: TEXT }}>Open Repairs ({activeRepairs.length})</h3>
          {activeRepairs.length === 0 ? (
            <p style={{ color: TEXT_MUTED, fontSize: 13 }}>No active repairs</p>
          ) : activeRepairs.slice(0, 5).map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.repair_code}</div>
                <div style={{ fontSize: 12, color: TEXT_MUTED }}>{r.asset?.name || r.asset?.asset_code}</div>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...styles.card, marginTop: 0 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: TEXT }}>Assets by Site</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {sites.filter(s => s.status === "active").map(s => (
            <div key={s.id} style={{ padding: 16, background: "#fafaf9", borderRadius: 10, border: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: TEXT }}>{siteAssetCount(s.id)}</div>
              <div style={{ fontSize: 11, color: TEXT_MUTED }}>{siteDeptCount(s.id)} departments</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  // ==================== ASSET REGISTER ====================
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetForm, setAssetForm] = useState<Partial<Asset>>({});

  const handleCreateAsset = async () => {
    if (!org || !assetForm.name || !assetForm.serial_number || !assetForm.site_id) return;
    const assetCount = assets.length + 1;
    const code = `AST-${String(assetCount).padStart(5, "0")}`;
    const tag = `MGY-${String(assetCount).padStart(5, "0")}`;
    const { error } = await supabase.from("assets").insert({
      ...assetForm, org_id: org.id, asset_code: code, asset_tag: tag,
      status: "active", condition: "new", lifecycle_stage: "procurement",
      purchase_value: Number(assetForm.purchase_value) || 0, current_value: Number(assetForm.current_value) || 0,
    });
    if (!error) { setShowAssetModal(false); setAssetForm({}); fetchAll(); }
  };

  const AssetRegisterPage = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <select style={{ ...styles.select, width: 200 }} value={siteFilter} onChange={e => setSiteFilter(e.target.value)}>
            <option value="all">All Sites</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button style={styles.btn("primary")} onClick={() => setShowAssetModal(true)}>+ Add Asset</button>
      </div>
      <div style={styles.card}>
        {filteredAssets.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💻</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 8 }}>No assets yet</h3>
            <p style={{ fontSize: 13, marginBottom: 16 }}>Start by adding your first IT asset</p>
            <button style={styles.btn("primary")} onClick={() => setShowAssetModal(true)}>+ Add First Asset</button>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Asset</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Serial</th>
                <th style={styles.th}>Site</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Condition</th>
                <th style={styles.th}>Risk</th>
                <th style={styles.th}>Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(a => (
                <tr key={a.id} style={{ cursor: "pointer" }}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: TEXT_MUTED }}>{a.asset_tag}</div>
                  </td>
                  <td style={styles.td}>{a.asset_type}</td>
                  <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 12 }}>{a.serial_number}</td>
                  <td style={styles.td}>{a.site?.name || "—"}</td>
                  <td style={styles.td}><StatusBadge status={a.status} /></td>
                  <td style={styles.td}><ConditionBadge condition={a.condition} /></td>
                  <td style={styles.td}>{a.risk_level ? <RiskBadge risk={a.risk_level} /> : "—"}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>${Number(a.current_value).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showAssetModal} onClose={() => setShowAssetModal(false)} title="Add New Asset">
        <div style={styles.formGroup}><label style={styles.label}>Asset Name</label><input style={styles.input} placeholder="e.g. Dell Latitude 5540" value={assetForm.name || ""} onChange={e => setAssetForm({ ...assetForm, name: e.target.value })} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={styles.formGroup}><label style={styles.label}>Category</label>
            <select style={styles.select} value={assetForm.category || ""} onChange={e => setAssetForm({ ...assetForm, category: e.target.value })}>
              <option value="">Select...</option>
              {["hardware", "software", "network", "peripheral", "license", "component"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}><label style={styles.label}>Asset Type</label>
            <select style={styles.select} value={assetForm.asset_type || ""} onChange={e => setAssetForm({ ...assetForm, asset_type: e.target.value })}>
              <option value="">Select...</option>
              {assetTypes.filter(t => !assetForm.category || t.category === assetForm.category).map(t => <option key={t.id} value={t.name}>{t.icon} {t.name}</option>)}
            </select>
          </div>
        </div>
        <div style={styles.formGroup}><label style={styles.label}>Serial Number</label><input style={styles.input} placeholder="e.g. SN-12345678" value={assetForm.serial_number || ""} onChange={e => setAssetForm({ ...assetForm, serial_number: e.target.value })} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={styles.formGroup}><label style={styles.label}>Manufacturer</label><input style={styles.input} placeholder="e.g. Dell" value={assetForm.manufacturer || ""} onChange={e => setAssetForm({ ...assetForm, manufacturer: e.target.value })} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Model</label><input style={styles.input} placeholder="e.g. Latitude 5540" value={assetForm.model || ""} onChange={e => setAssetForm({ ...assetForm, model: e.target.value })} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={styles.formGroup}><label style={styles.label}>Site</label>
            <select style={styles.select} value={assetForm.site_id || ""} onChange={e => setAssetForm({ ...assetForm, site_id: e.target.value, department_id: undefined })}>
              <option value="">Select site...</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}><label style={styles.label}>Department</label>
            <select style={styles.select} value={assetForm.department_id || ""} onChange={e => setAssetForm({ ...assetForm, department_id: e.target.value })}>
              <option value="">Select department...</option>
              {departments.filter(d => d.site_id === assetForm.site_id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div style={styles.formGroup}><label style={styles.label}>Hostname</label><input style={styles.input} placeholder="e.g. HO-LPT-001" value={assetForm.hostname || ""} onChange={e => setAssetForm({ ...assetForm, hostname: e.target.value })} /></div>
          <div style={styles.formGroup}><label style={styles.label}>IP Address</label><input style={styles.input} placeholder="e.g. 10.0.1.100" value={assetForm.ip_address || ""} onChange={e => setAssetForm({ ...assetForm, ip_address: e.target.value })} /></div>
          <div style={styles.formGroup}><label style={styles.label}>OS</label><input style={styles.input} placeholder="e.g. Windows 11 Pro" value={assetForm.operating_system || ""} onChange={e => setAssetForm({ ...assetForm, operating_system: e.target.value })} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={styles.formGroup}><label style={styles.label}>Purchase Value ($)</label><input style={styles.input} type="number" placeholder="0" value={assetForm.purchase_value || ""} onChange={e => setAssetForm({ ...assetForm, purchase_value: Number(e.target.value), current_value: Number(e.target.value) })} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Purchase Date</label><input style={styles.input} type="date" value={assetForm.purchase_date || ""} onChange={e => setAssetForm({ ...assetForm, purchase_date: e.target.value })} /></div>
        </div>
        <div style={styles.formGroup}><label style={styles.label}>Notes</label><textarea style={{ ...styles.input, minHeight: 60 }} value={assetForm.notes || ""} onChange={e => setAssetForm({ ...assetForm, notes: e.target.value })} /></div>
        <button style={{ ...styles.btn("primary"), width: "100%", padding: 14, fontSize: 15, marginTop: 8 }} onClick={handleCreateAsset}>Create Asset</button>
      </Modal>
    </>
  );

  // ==================== SITES ====================
  const SitesPage = () => (
    <div style={styles.cardGrid}>
      {sites.map(s => (
        <div key={s.id} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{s.name}</h3>
              <div style={{ fontSize: 12, color: GOLD, fontWeight: 600, marginTop: 2 }}>{s.site_code}</div>
            </div>
            <StatusBadge status={s.status} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: 1.5 }}>Location</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{s.state_region}, {s.country}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: 1.5 }}>Total Assets</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{siteAssetCount(s.id)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: 1.5 }}>Site Manager</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{s.manager_name || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: 1.5 }}>Departments</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{siteDeptCount(s.id)} active</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ==================== TRANSFERS ====================
  const TransfersPage = () => (
    <div style={styles.card}>
      {transfers.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>No transfers yet</h3>
          <p style={{ fontSize: 13 }}>Transfers will appear here when assets are moved between sites</p>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Transfer</th>
              <th style={styles.th}>From</th>
              <th style={styles.th}>To</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.id}>
                <td style={{ ...styles.td, fontWeight: 600, fontFamily: "monospace" }}>{t.transfer_code}</td>
                <td style={styles.td}>{t.from_site?.name || "—"}</td>
                <td style={styles.td}>{t.to_site?.name || "—"}</td>
                <td style={styles.td}>{t.reason}</td>
                <td style={styles.td}><StatusBadge status={t.status} /></td>
                <td style={{ ...styles.td, fontSize: 12, color: TEXT_MUTED }}>{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ==================== REPAIRS ====================
  const RepairsPage = () => (
    <div style={styles.card}>
      {repairs.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>No repairs logged</h3>
          <p style={{ fontSize: 13 }}>Repair requests will appear here</p>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Repair</th>
              <th style={styles.th}>Asset</th>
              <th style={styles.th}>Issue</th>
              <th style={styles.th}>Urgency</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Est. Cost</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map(r => (
              <tr key={r.id}>
                <td style={{ ...styles.td, fontWeight: 600, fontFamily: "monospace" }}>{r.repair_code}</td>
                <td style={styles.td}>{r.asset?.name || r.asset?.asset_code || "—"}</td>
                <td style={{ ...styles.td, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{r.issue_description}</td>
                <td style={styles.td}><RiskBadge risk={r.urgency} /></td>
                <td style={styles.td}>{r.repair_type === "in_house" ? "In-House" : "External"}</td>
                <td style={styles.td}><StatusBadge status={r.status} /></td>
                <td style={styles.td}>{r.estimated_cost ? `$${Number(r.estimated_cost).toLocaleString()}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ==================== USERS ====================
  const UsersPage = () => (
    <div style={styles.card}>
      {profiles.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>No users registered</h3>
          <p style={{ fontSize: 13 }}>Users will appear here once they sign up and are added to the organization</p>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id}>
                <td style={{ ...styles.td, fontWeight: 600 }}>{p.full_name}</td>
                <td style={{ ...styles.td, color: TEXT_MUTED }}>{p.email}</td>
                <td style={styles.td}><StatusBadge status={p.role} /></td>
                <td style={styles.td}>{p.is_active ? <span style={styles.badge("#22c55e")}>Active</span> : <span style={styles.badge("#ef4444")}>Inactive</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ==================== REPORTS ====================
  const ReportsPage = () => {
    const byCat = assetTypes.reduce<Record<string, number>>((acc, t) => {
      const count = assets.filter(a => a.asset_type === t.name).length;
      if (count > 0) acc[t.name] = count;
      return acc;
    }, {});
    const byStatus = assets.reduce<Record<string, number>>((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={styles.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Assets by Type</h3>
          {Object.keys(byCat).length === 0 ? <p style={{ color: TEXT_MUTED, fontSize: 13 }}>No asset data yet</p> :
            Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 13 }}>{type}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{count}</span>
              </div>
            ))}
        </div>
        <div style={styles.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Assets by Status</h3>
          {Object.keys(byStatus).length === 0 ? <p style={{ color: TEXT_MUTED, fontSize: 13 }}>No asset data yet</p> :
            Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <div key={status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                <StatusBadge status={status} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{count}</span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // ==================== AUDIT TRAIL ====================
  const AuditPage = () => (
    <div style={styles.card}>
      {auditLog.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>No audit entries</h3>
          <p style={{ fontSize: 13 }}>All system activities will be logged here</p>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Timestamp</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Action</th>
              <th style={styles.th}>Entity</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map(a => (
              <tr key={a.id}>
                <td style={{ ...styles.td, fontSize: 12, color: TEXT_MUTED, fontFamily: "monospace" }}>{new Date(a.created_at).toLocaleString()}</td>
                <td style={styles.td}>{a.user?.full_name || "System"}</td>
                <td style={styles.td}><StatusBadge status={a.action} /></td>
                <td style={styles.td}>{a.entity_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ==================== SETTINGS ====================
  const SettingsPage = () => (
    <div style={styles.card}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Organization</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div><label style={styles.label}>Organization Name</label><div style={{ fontSize: 15, fontWeight: 500 }}>{org?.name || "—"}</div></div>
        <div><label style={styles.label}>Slug</label><div style={{ fontSize: 15, fontWeight: 500 }}>{org?.slug || "—"}</div></div>
      </div>
      <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, margin: "24px 0" }} />
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Asset Types ({assetTypes.length})</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
        {assetTypes.map(t => (
          <div key={t.id} style={{ padding: "8px 12px", background: "#fafaf9", borderRadius: 8, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span>{t.icon}</span>
            <span style={{ fontWeight: 500 }}>{t.name}</span>
            <span style={{ fontSize: 10, color: TEXT_MUTED, marginLeft: "auto", textTransform: "uppercase" }}>{t.category}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ==================== PAGE ROUTER ====================
  const renderPage = () => {
    if (loading) return <div style={styles.loading}>Loading data...</div>;
    switch (page) {
      case "dashboard": return <DashboardPage />;
      case "assets": return <AssetRegisterPage />;
      case "sites": return <SitesPage />;
      case "transfers": return <TransfersPage />;
      case "repairs": return <RepairsPage />;
      case "users": return <UsersPage />;
      case "reports": return <ReportsPage />;
      case "audit": return <AuditPage />;
      case "settings": return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  const pageLabel = NAV_ITEMS.find(n => n.key === page)?.label || "Dashboard";

  // ==================== RENDER ====================
  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={{ width: 40, height: 40, background: GOLD, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: BG, marginBottom: 10 }}>M</div>
          <h1 style={styles.logoTitle}>{org?.name || "Magaya Mining"}</h1>
          <p style={styles.logoSub}>IT Asset Management</p>
        </div>
        <nav style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
          {["MAIN", "MANAGEMENT", "SYSTEM"].map(section => (
            <div key={section}>
              <div style={styles.navSection}>{section}</div>
              {NAV_ITEMS.filter(n => n.section === section).map(n => (
                <div key={n.key} style={styles.navItem(page === n.key)} onClick={() => setPage(n.key)}>
                  <span>{n.icon}</span>
                  <span>{n.label}</span>
                  {n.key === "assets" && assets.length > 0 && <span style={{ marginLeft: "auto", background: GOLD, color: BG, borderRadius: 10, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>{assets.length}</span>}
                  {n.key === "transfers" && activeTransfers.length > 0 && <span style={{ marginLeft: "auto", background: "#3b82f6", color: "#fff", borderRadius: 10, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>{activeTransfers.length}</span>}
                  {n.key === "repairs" && activeRepairs.length > 0 && <span style={{ marginLeft: "auto", background: "#f59e0b", color: BG, borderRadius: 10, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>{activeRepairs.length}</span>}
                </div>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>{pageLabel}</h1>
            <p style={styles.breadcrumb}>{org?.name || "Magaya Mining"} → {pageLabel}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select style={{ ...styles.select, width: 160 }} value={siteFilter} onChange={e => setSiteFilter(e.target.value)}>
              <option value="all">All Sites</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        {renderPage()}
      </main>
    </div>
  );
}
