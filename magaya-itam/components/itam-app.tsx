'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Search, Bell, ChevronDown, ChevronRight, Plus, Filter, Download, Upload, Settings, Users, Monitor, Cpu, HardDrive, Wifi, Shield, AlertTriangle, CheckCircle, Clock, ArrowRight, ArrowLeftRight, Wrench, FileText, BarChart as BarChartIcon, Home, Package, Truck, Clipboard, Database, MapPin, Calendar, DollarSign, TrendingUp, Activity, Eye, Edit, Trash2, MoreVertical, X, Menu, Moon, Sun, ChevronLeft, Globe, Server, Printer, Smartphone, Laptop, Router, Camera } from "lucide-react";

const LOGO_ICON = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCACAAIADASIAAhEBAxEB/8QAGwABAAMBAQEBAAAAAAAAAAAAAAECAwQIBQf/xAA0EAABAwIDBQcCBgMBAAAAAAABAAIRAxIEITETQVFhcQUGIjKBkbHR8AcjM6HB4UJSYnL/xAAYAQEAAwEAAAAAAAAAAAAAAAAAAQQGBf/EACERAQACAQMEAwAAAAAAAAAAAAABAgMEBREGMUFhIULh/9oADAMBAAIRAxEAPwDxkiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAtqcU6e1dN5/TE6c/p/SrSYDL3zY3WN/JTFTEVTEE8zAA0Az3aBAeBUpmq0QR5wPnp971krscab504/yFNZrQQ5k2O0ndxCDNEUgEkACSdAghFL2uY4tcCHAwQdyhAREQEREBERAVqbC94aI6nQc1VbPOyYaIMl3nMcN0/efRBDvGW0qYNo8o480rOAbsqbpYDJP+x4/Mf2pJNJhb/m4Z8hw9f63lYoN2upVYFQubUOV+7kT98811dhYrDYHtfD1e0cAztHBU6zXYjBvqOY2s0HNtzSCDE5g7185btO2ZaSL2Dw8XDh1Hx6BRasWiYlMTx8vcfdPuv8Ahh3l7oYPHdjd1ewK/ZmKo+CcBT2jToWudF4eDIPimd68s/jt2b3N7v8Af3F9mdyzWbSos2eLYapfSpVtHMpuMuIjIyTmXCY04e4P4m96O5XY/a3ZfY2IY2h2jTgXgk4epptafB9sjhodQF+PH5jnVqrnETLjMlxO7qc81kdj6f1W3a3LlyZptj+sTMzzz5t7jt77r+q1ePNjrWKxE+fwyq0t+0YMsvM36j46LFavFjm1KRdBzaZzB+oSqA4CozQ+YAaH6fe5a9z2SIiAiIgIiINMPUFOrfmCB4XDVp4hXs2TRVfaZ8g1DufQf1xWdOmXsqOBA2bbjzzA/lSKXhuuEWlx5ZxHx7oKOcXOLnElxMkk5lQpg5RnKu6lAqEPa6x0Zbxnn0y/cIM1IJBBBghb08MXAXFwJbdDWyQN0yRE7vTiqYii6kZ8VpJEuaWkEagjjp7oL2bf8xtrSM6kCA3/AKyGQz9+oWVV98ACGN0HyepVtiZc24XBl0fvHtn6KBRc4Ath0iQBqeXVBNB7QSypNjtSNQdxVmNNG41NCIjW7py5qBQNwaajBL7Zn3PRULTsw+ZEx0+/qgoiIgIiICIiDowgJo4qAT+UNP8A21dmJrW16j2YdlrHl5AZ4WEG20jywSGnPl6/MY5zHXNcWniDCm91pbc60mSJyKDdrHCqX25sBIEb5gfvn6Loq0wBSbayCyx1tRroyEE2knzZ59FxbatddtXzETcdFVj3sMsc5p4gwg7WhrS11ZrnUw9hcxxID7RDmyND/B6TD6Rc8Mq0ywNdMhhaS2JMA8hkr0uz3uw7MQBiBTcJJDRnGrhnmBDpO6M4lctOdk921qB1PNkaZmD0QdZ22wFRzWON+1ey5txnXKboI3RpmuYB9Pa023SyHscJBG72IPwr06F1E4o1KrTBIJjxOEaGc9c+HqsZcKe2FSoKhdBM7uqDapTeK1VrR+mdi3dxBPzPVaYxhc8iG2lmVjmuAImB4SRpl+6riMOaFGo8VaoDz4WnIvEkFxE6c/oq0cO+xwbUe1xZc5o4ECPQ3D3QcaIiAiIgIiICIiAiIg6BjMQGMYHNtY21osGkzGmaxa9wa5oiH65BVRBoK9QNtBFsRFo+5z1Vb3bOzK2Z0VUQa1K9SoHBxabonwge3DRTTxNWm21rhERm0HfP0WKICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiD//2Q==";

// ==================== MOCK DATA ====================
const SITES = [
  { id: "SITE-0001", name: "Magaya HQ", city: "Harare", country: "Zimbabwe", status: "Active", assets: 2847, manager: "Tatenda Moyo" },
  { id: "SITE-0002", name: "Shamva Mine", city: "Shamva", country: "Zimbabwe", status: "Active", assets: 1563, manager: "Chipo Ndlovu" },
  { id: "SITE-0003", name: "Penhalonga Operations", city: "Mutare", country: "Zimbabwe", status: "Active", assets: 892, manager: "Farai Madziva" },
  { id: "SITE-0004", name: "Kwekwe Processing", city: "Kwekwe", country: "Zimbabwe", status: "Under Maintenance", assets: 421, manager: "Rudo Chipanga" },
];

const ASSETS = [
  { id: "HQ-LPT-2024-00001", tag: "MGY-001245", category: "Hardware", type: "Laptop", name: "Dell Latitude 5540", serial: "DXRT78523H", manufacturer: "Dell", model: "Latitude 5540", os: "Windows 11 Pro", status: "Deployed", condition: "Good", site: "Magaya HQ", department: "Engineering", custodian: "Tatenda Moyo", purchaseDate: "2024-01-15", value: 1250, currentValue: 1050, warrantyExp: "2027-01-15", lifecycle: "Deployment", risk: "Medium" },
  { id: "HQ-DSK-2024-00002", tag: "MGY-001246", category: "Hardware", type: "Desktop", name: "HP EliteDesk 800 G9", serial: "HP92847561K", manufacturer: "HP", model: "EliteDesk 800 G9", os: "Windows 11 Pro", status: "Active", condition: "Excellent", site: "Magaya HQ", department: "Finance", custodian: "Chipo Ndlovu", purchaseDate: "2024-03-20", value: 980, currentValue: 890, warrantyExp: "2027-03-20", lifecycle: "Deployment", risk: "Low" },
  { id: "SM-SRV-2023-00003", tag: "MGY-002100", category: "Hardware", type: "Server", name: "Dell PowerEdge R750", serial: "SVRDELL7823", manufacturer: "Dell", model: "PowerEdge R750", os: "Ubuntu 22.04 LTS", status: "Active", condition: "Excellent", site: "Shamva Mine", department: "IT", custodian: "Farai Madziva", purchaseDate: "2023-06-10", value: 8500, currentValue: 6800, warrantyExp: "2026-06-10", lifecycle: "Deployment", risk: "Critical" },
  { id: "HQ-NET-2024-00004", tag: "MGY-003050", category: "Network", type: "Switch", name: "Cisco Catalyst 9300", serial: "CSC49300X1", manufacturer: "Cisco", model: "Catalyst 9300", os: "IOS XE", status: "Active", condition: "Good", site: "Magaya HQ", department: "IT", custodian: "Tatenda Moyo", purchaseDate: "2024-02-28", value: 3200, currentValue: 2750, warrantyExp: "2027-02-28", lifecycle: "Deployment", risk: "Critical" },
  { id: "PO-LPT-2024-00005", tag: "MGY-004010", category: "Hardware", type: "Laptop", name: "Lenovo ThinkPad X1 Carbon", serial: "LNV83921JK", manufacturer: "Lenovo", model: "ThinkPad X1 Carbon", os: "Windows 11 Pro", status: "Under Repair", condition: "Fair", site: "Penhalonga Operations", department: "Geology", custodian: "Rudo Chipanga", purchaseDate: "2023-11-05", value: 1800, currentValue: 1350, warrantyExp: "2026-11-05", lifecycle: "Maintenance", risk: "High" },
  { id: "SM-MNT-2023-00006", tag: "MGY-005200", category: "Peripheral", type: "Monitor", name: "Dell U2723QE 4K", serial: "MNT27DL892", manufacturer: "Dell", model: "U2723QE", os: "N/A", status: "In Storage", condition: "New", site: "Shamva Mine", department: "IT", custodian: "Unassigned", purchaseDate: "2024-04-01", value: 550, currentValue: 550, warrantyExp: "2027-04-01", lifecycle: "Procurement", risk: "Low" },
  { id: "HQ-PRN-2024-00007", tag: "MGY-006100", category: "Peripheral", type: "Printer", name: "HP LaserJet Pro M404dn", serial: "HPPRN40421", manufacturer: "HP", model: "LaserJet Pro M404dn", os: "N/A", status: "Active", condition: "Good", site: "Magaya HQ", department: "Admin", custodian: "Chipo Ndlovu", purchaseDate: "2024-01-20", value: 320, currentValue: 270, warrantyExp: "2026-01-20", lifecycle: "Deployment", risk: "Low" },
  { id: "KW-LPT-2024-00008", tag: "MGY-007055", category: "Hardware", type: "Laptop", name: "Apple MacBook Pro 14", serial: "APPMB14X92", manufacturer: "Apple", model: 'MacBook Pro 14"', os: "macOS Sonoma", status: "Deployed", condition: "Excellent", site: "Kwekwe Processing", department: "Engineering", custodian: "Farai Madziva", purchaseDate: "2024-05-10", value: 2400, currentValue: 2200, warrantyExp: "2027-05-10", lifecycle: "Deployment", risk: "Medium" },
  { id: "HQ-PHN-2023-00009", tag: "MGY-008200", category: "Hardware", type: "Smartphone", name: "Samsung Galaxy S24 Ultra", serial: "SMSG24U781", manufacturer: "Samsung", model: "Galaxy S24 Ultra", os: "Android 14", status: "Disposed", condition: "Non-functional", site: "Magaya HQ", department: "Operations", custodian: "N/A", purchaseDate: "2022-03-15", value: 1100, currentValue: 0, warrantyExp: "2024-03-15", lifecycle: "Disposal", risk: "Low" },
  { id: "SM-CAM-2024-00010", tag: "MGY-009300", category: "Peripheral", type: "Camera", name: "Axis P3265-LVE Security Cam", serial: "AXIS326521", manufacturer: "Axis", model: "P3265-LVE", os: "N/A", status: "Active", condition: "New", site: "Shamva Mine", department: "Security", custodian: "Tatenda Moyo", purchaseDate: "2024-06-01", value: 680, currentValue: 640, warrantyExp: "2027-06-01", lifecycle: "Deployment", risk: "High" },
];

const TRANSFERS = [
  { id: "TRF-2024-001", assets: ["HQ-LPT-2024-00001"], from: "Magaya HQ", to: "Shamva Mine", status: "Completed", date: "2024-05-15", reason: "Reallocation", initiator: "Tatenda Moyo" },
  { id: "TRF-2024-002", assets: ["PO-LPT-2024-00005"], from: "Penhalonga Operations", to: "Magaya HQ", status: "In Transit", date: "2024-06-20", reason: "Repair", initiator: "Rudo Chipanga" },
  { id: "TRF-2024-003", assets: ["SM-MNT-2023-00006", "SM-CAM-2024-00010"], from: "Shamva Mine", to: "Kwekwe Processing", status: "Pending Approval", date: "2024-06-25", reason: "Project", initiator: "Chipo Ndlovu" },
];

const REPAIRS = [
  { id: "RPR-2024-001", assetId: "PO-LPT-2024-00005", asset: "Lenovo ThinkPad X1 Carbon", issue: "Cracked screen & keyboard malfunction", status: "In Progress", vendor: "TechFix Solutions", cost: 350, created: "2024-06-18", expected: "2024-07-05", urgency: "High" },
  { id: "RPR-2024-002", assetId: "HQ-PRN-2024-00007", asset: "HP LaserJet Pro M404dn", issue: "Paper jam mechanism failure", status: "Diagnosed", vendor: "HP Service Center", cost: 120, created: "2024-06-22", expected: "2024-07-10", urgency: "Medium" },
  { id: "RPR-2024-003", assetId: "HQ-DSK-2024-00002", asset: "HP EliteDesk 800 G9", issue: "Power supply replacement", status: "Completed", vendor: "In-House", cost: 85, created: "2024-06-01", expected: "2024-06-05", urgency: "Low" },
];

const MONTHLY_DATA = [
  { month: "Jan", acquisitions: 45, disposals: 12, value: 82000 },
  { month: "Feb", acquisitions: 32, disposals: 8, value: 65000 },
  { month: "Mar", acquisitions: 58, disposals: 15, value: 110000 },
  { month: "Apr", acquisitions: 41, disposals: 22, value: 78000 },
  { month: "May", acquisitions: 67, disposals: 18, value: 145000 },
  { month: "Jun", acquisitions: 53, disposals: 25, value: 98000 },
];

const STATUS_COLORS = {
  "Active": "#22c55e", "Deployed": "#3b82f6", "In Storage": "#8b5cf6",
  "Under Repair": "#f59e0b", "Disposed": "#6b7280", "Sold": "#06b6d4",
  "Damaged": "#ef4444", "Lost/Missing": "#dc2626", "In Transit": "#D4AF37",
  "Completed": "#22c55e", "Pending Approval": "#f59e0b", "Rejected": "#ef4444",
  "In Progress": "#3b82f6", "Diagnosed": "#8b5cf6", "Awaiting Parts": "#f59e0b",
};

const CATEGORY_ICONS = { "Hardware": Cpu, "Network": Wifi, "Peripheral": Monitor, "Software": Database, "License": Shield, "Component": HardDrive };
const TYPE_ICONS = { "Laptop": Laptop, "Desktop": Monitor, "Server": Server, "Switch": Router, "Monitor": Monitor, "Printer": Printer, "Smartphone": Smartphone, "Camera": Camera };

const PIE_DATA = [
  { name: "Active", value: 2847, color: "#22c55e" },
  { name: "Deployed", value: 1563, color: "#3b82f6" },
  { name: "In Storage", value: 421, color: "#8b5cf6" },
  { name: "Under Repair", value: 89, color: "#f59e0b" },
  { name: "Disposed", value: 156, color: "#6b7280" },
];

const CATEGORY_DATA = [
  { name: "Hardware", count: 3200 },
  { name: "Network", count: 890 },
  { name: "Peripheral", count: 1250 },
  { name: "Software", count: 450 },
  { name: "License", count: 680 },
  { name: "Component", count: 253 },
];

const ALERTS = [
  { type: "warranty", message: "15 assets have warranties expiring in 30 days", severity: "high" },
  { type: "repair", message: "3 repairs overdue by more than 5 days", severity: "medium" },
  { type: "transfer", message: "2 transfers pending approval", severity: "low" },
  { type: "audit", message: "Quarterly audit due for Shamva Mine", severity: "high" },
];

const AUDIT_LOG = [
  { timestamp: "2024-06-25 14:32:05", user: "Tatenda Moyo", action: "UPDATE", asset: "HQ-LPT-2024-00001", field: "Status", from: "Active", to: "Deployed" },
  { timestamp: "2024-06-25 13:15:22", user: "Chipo Ndlovu", action: "CREATE", asset: "SM-CAM-2024-00010", field: "N/A", from: "", to: "New Asset" },
  { timestamp: "2024-06-25 11:45:10", user: "Farai Madziva", action: "TRANSFER", asset: "PO-LPT-2024-00005", field: "Site", from: "Penhalonga Operations", to: "Magaya HQ" },
  { timestamp: "2024-06-24 16:20:33", user: "Rudo Chipanga", action: "UPDATE", asset: "KW-LPT-2024-00008", field: "Condition", from: "New", to: "Excellent" },
  { timestamp: "2024-06-24 09:05:17", user: "System", action: "ALERT", asset: "Multiple", field: "Warranty", from: "", to: "15 warranties expiring soon" },
];

// ==================== STYLES ====================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Neuton:wght@200;300;400;700;800&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  :root {
    --primary: #0A0A0A;
    --gold: #D4AF37;
    --gold-light: #E8D48B;
    --gold-dark: #B8941F;
    --white: #FFFFFF;
    --gray-50: #FAFAFA;
    --gray-100: #F5F5F5;
    --gray-200: #E5E5E5;
    --gray-300: #D4D4D4;
    --gray-400: #A3A3A3;
    --gray-500: #737373;
    --gray-600: #525252;
    --gray-700: #404040;
    --gray-800: #262626;
    --gray-900: #171717;
    --sidebar-w: 260px;
    --header-h: 64px;
  }
  
  body { font-family: 'Neuton', serif; background: var(--gray-100); color: var(--primary); }
  
  .app { display: flex; min-height: 100vh; }
  
  /* Sidebar */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--primary);
    color: var(--white);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    transition: transform 0.3s ease;
  }
  .sidebar.collapsed { transform: translateX(-100%); }
  
  .sidebar-logo {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(212,175,55,0.15);
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .sidebar-logo img { width: 42px; height: 42px; border-radius: 8px; }
  .sidebar-logo-text h2 { font-size: 18px; font-weight: 700; letter-spacing: 0.5px; color: var(--white); line-height: 1.2; }
  .sidebar-logo-text span { font-size: 11px; color: var(--gold); text-transform: uppercase; letter-spacing: 2px; font-weight: 400; }
  
  .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
  .sidebar-section { margin-bottom: 24px; }
  .sidebar-section-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--gray-500);
    padding: 0 12px;
    margin-bottom: 8px;
    font-weight: 400;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 15px;
    color: var(--gray-400);
    margin-bottom: 2px;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-family: 'Neuton', serif;
  }
  .nav-item:hover { background: rgba(212,175,55,0.08); color: var(--white); }
  .nav-item.active {
    background: rgba(212,175,55,0.12);
    color: var(--gold);
    font-weight: 700;
  }
  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    width: 3px;
    height: 24px;
    background: var(--gold);
    border-radius: 0 4px 4px 0;
  }
  .nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
  
  .nav-badge {
    margin-left: auto;
    background: var(--gold);
    color: var(--primary);
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 10px;
    line-height: 1.4;
  }
  
  /* Main Content */
  .main-content {
    flex: 1;
    margin-left: var(--sidebar-w);
    min-height: 100vh;
    transition: margin-left 0.3s ease;
  }
  .main-content.expanded { margin-left: 0; }
  
  /* Header */
  .header {
    height: var(--header-h);
    background: var(--white);
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    position: sticky;
    top: 0;
    z-index: 40;
  }
  .header-left { display: flex; align-items: center; gap: 16px; }
  .header-title { font-size: 22px; font-weight: 700; color: var(--primary); }
  .header-breadcrumb { font-size: 13px; color: var(--gray-500); display: flex; align-items: center; gap: 6px; }
  .header-right { display: flex; align-items: center; gap: 16px; }
  
  .menu-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--primary);
    padding: 4px;
  }
  
  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--gray-100);
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 8px 14px;
    width: 320px;
    transition: border-color 0.2s;
  }
  .search-box:focus-within { border-color: var(--gold); }
  .search-box input {
    border: none;
    background: none;
    outline: none;
    font-family: 'Neuton', serif;
    font-size: 14px;
    width: 100%;
    color: var(--primary);
  }
  .search-box input::placeholder { color: var(--gray-400); }
  
  .header-btn {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 1px solid var(--gray-200);
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    color: var(--gray-600);
  }
  .header-btn:hover { border-color: var(--gold); color: var(--gold); }
  .header-btn .badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 18px;
    height: 18px;
    background: #ef4444;
    color: white;
    font-size: 10px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }
  
  .site-switcher {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--gray-200);
    background: var(--white);
    cursor: pointer;
    font-family: 'Neuton', serif;
    font-size: 14px;
    color: var(--primary);
    transition: border-color 0.2s;
  }
  .site-switcher:hover { border-color: var(--gold); }
  
  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--gold);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
  }
  
  /* Page Content */
  .page-content { padding: 28px 32px; }
  
  /* Cards */
  .card {
    background: var(--white);
    border-radius: 12px;
    border: 1px solid var(--gray-200);
    overflow: hidden;
    transition: box-shadow 0.2s;
  }
  .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
  .card-header {
    padding: 18px 22px;
    border-bottom: 1px solid var(--gray-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .card-header h3 { font-size: 16px; font-weight: 700; }
  .card-body { padding: 22px; }
  
  /* KPI Cards */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
  .kpi-card {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    padding: 22px;
    transition: all 0.2s;
    cursor: default;
  }
  .kpi-card:hover { border-color: var(--gold); box-shadow: 0 4px 12px rgba(212,175,55,0.1); }
  .kpi-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .kpi-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .kpi-card-top .kpi-trend { font-size: 12px; display: flex; align-items: center; gap: 3px; font-weight: 700; }
  .kpi-value { font-size: 30px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .kpi-label { font-size: 13px; color: var(--gray-500); text-transform: uppercase; letter-spacing: 1px; }
  
  /* Charts Grid */
  .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 28px; }
  .charts-grid-equal { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
  
  /* Tables */
  .table-wrapper { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left;
    padding: 12px 16px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--gray-500);
    font-weight: 400;
    border-bottom: 1px solid var(--gray-200);
    background: var(--gray-50);
    white-space: nowrap;
  }
  td {
    padding: 14px 16px;
    font-size: 14px;
    border-bottom: 1px solid var(--gray-100);
    white-space: nowrap;
  }
  tr:hover td { background: rgba(212,175,55,0.03); }
  
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; }
  
  .condition-badge {
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
  }
  
  /* Action Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 8px;
    font-family: 'Neuton', serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    white-space: nowrap;
  }
  .btn-primary { background: var(--gold); color: var(--primary); }
  .btn-primary:hover { background: var(--gold-dark); }
  .btn-outline { background: transparent; border: 1px solid var(--gray-300); color: var(--gray-700); }
  .btn-outline:hover { border-color: var(--gold); color: var(--gold); }
  .btn-sm { padding: 6px 12px; font-size: 13px; }
  .btn-icon {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: 1px solid var(--gray-200);
    background: var(--white);
    cursor: pointer;
    color: var(--gray-500);
    transition: all 0.2s;
  }
  .btn-icon:hover { border-color: var(--gold); color: var(--gold); }
  
  .toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .toolbar-actions { display: flex; align-items: center; gap: 10px; }
  
  /* Filter chips */
  .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .chip {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--gray-200);
    background: var(--white);
    color: var(--gray-600);
    font-family: 'Neuton', serif;
    font-weight: 400;
  }
  .chip:hover { border-color: var(--gold); color: var(--gold); }
  .chip.active { background: var(--gold); color: var(--primary); border-color: var(--gold); font-weight: 700; }
  
  /* Alerts */
  .alert-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 14px;
    border-left: 3px solid;
  }
  .alert-high { background: #fef2f2; border-color: #ef4444; }
  .alert-medium { background: #fffbeb; border-color: #f59e0b; }
  .alert-low { background: #f0fdf4; border-color: #22c55e; }
  
  /* Activity Feed */
  .activity-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--gray-100);
  }
  .activity-item:last-child { border-bottom: none; }
  .activity-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 6px;
    flex-shrink: 0;
  }
  .activity-text { font-size: 13px; color: var(--gray-600); line-height: 1.5; }
  .activity-text strong { color: var(--primary); }
  .activity-time { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
  
  /* Detail Panel */
  .detail-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 520px;
    height: 100vh;
    background: var(--white);
    border-left: 1px solid var(--gray-200);
    z-index: 60;
    overflow-y: auto;
    box-shadow: -8px 0 30px rgba(0,0,0,0.08);
    animation: slideIn 0.3s ease;
  }
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .detail-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: sticky;
    top: 0;
    background: var(--white);
    z-index: 1;
  }
  .detail-body { padding: 24px; }
  .detail-section { margin-bottom: 28px; }
  .detail-section h4 {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--gray-400);
    margin-bottom: 14px;
    font-weight: 400;
  }
  .detail-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 14px;
  }
  .detail-label { color: var(--gray-500); font-weight: 400; }
  .detail-value { color: var(--primary); font-weight: 400; }
  
  /* Modal Overlay */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 70;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--white);
    border-radius: 16px;
    width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    animation: modalIn 0.3s ease;
  }
  @keyframes modalIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-header {
    padding: 22px 28px;
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .modal-header h2 { font-size: 20px; font-weight: 700; }
  .modal-body { padding: 28px; }
  .modal-footer { padding: 16px 28px; border-top: 1px solid var(--gray-200); display: flex; justify-content: flex-end; gap: 10px; }
  
  .form-group { margin-bottom: 18px; }
  .form-label {
    display: block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--gray-500);
    margin-bottom: 6px;
    font-weight: 400;
  }
  .form-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    font-family: 'Neuton', serif;
    font-size: 15px;
    color: var(--primary);
    outline: none;
    transition: border-color 0.2s;
  }
  .form-input:focus { border-color: var(--gold); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  
  /* Lifecycle bar */
  .lifecycle-bar {
    display: flex;
    gap: 2px;
    margin-top: 8px;
  }
  .lifecycle-step {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: var(--gray-200);
    transition: background 0.3s;
  }
  .lifecycle-step.active { background: var(--gold); }
  .lifecycle-step.completed { background: #22c55e; }
  
  /* Tabs */
  .tabs { display: flex; border-bottom: 1px solid var(--gray-200); margin-bottom: 24px; }
  .tab {
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 400;
    color: var(--gray-500);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    background: none;
    border-top: none;
    border-left: none;
    border-right: none;
    font-family: 'Neuton', serif;
  }
  .tab:hover { color: var(--primary); }
  .tab.active { color: var(--gold); border-bottom-color: var(--gold); font-weight: 700; }
  
  /* Empty state */
  .empty-state { text-align: center; padding: 60px 20px; color: var(--gray-400); }
  .empty-state svg { margin-bottom: 16px; opacity: 0.3; }
  
  /* Sidebar footer */
  .sidebar-footer {
    padding: 16px 20px;
    border-top: 1px solid rgba(212,175,55,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .sidebar-footer-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--gold);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
  }
  .sidebar-footer-info { flex: 1; }
  .sidebar-footer-info .name { font-size: 13px; font-weight: 700; color: var(--white); }
  .sidebar-footer-info .role { font-size: 11px; color: var(--gray-500); }
  
  /* Responsive */
  @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 900px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .main-content { margin-left: 0 !important; }
    .menu-toggle { display: block; }
    .charts-grid, .charts-grid-equal { grid-template-columns: 1fr; }
    .search-box { width: 200px; }
    .detail-panel { width: 100%; }
  }
  @media (max-width: 600px) {
    .kpi-grid { grid-template-columns: 1fr; }
    .page-content { padding: 16px; }
    .header { padding: 0 16px; }
    .search-box { display: none; }
  }
`;

// ==================== COMPONENTS ====================

const StatusBadge = ({ status }) => {
  const color = STATUS_COLORS[status] || "#6b7280";
  return (
    <span className="status-badge" style={{ background: `${color}15`, color }}>
      <span className="status-dot" style={{ background: color }}></span>
      {status}
    </span>
  );
};

const ConditionBadge = ({ condition }) => {
  const colors = { "New": "#22c55e", "Excellent": "#3b82f6", "Good": "#8b5cf6", "Fair": "#f59e0b", "Poor": "#ef4444", "Non-functional": "#dc2626" };
  const c = colors[condition] || "#6b7280";
  return <span className="condition-badge" style={{ background: `${c}15`, color: c }}>{condition}</span>;
};

const RiskBadge = ({ risk }) => {
  const colors = { "Critical": "#dc2626", "High": "#ef4444", "Medium": "#f59e0b", "Low": "#22c55e" };
  const c = colors[risk] || "#6b7280";
  return <span style={{ color: c, fontWeight: 700, fontSize: 13 }}>{risk}</span>;
};

const formatCurrency = (v) => `$${v?.toLocaleString() || 0}`;

// ==================== DASHBOARD ====================
const Dashboard = ({ setPage, setSelectedAsset }) => {
  const totalAssets = SITES.reduce((a, s) => a + s.assets, 0);
  const totalValue = ASSETS.reduce((a, s) => a + s.currentValue, 0);
  
  return (
    <div>
      <div className="kpi-grid">
        {[
          { label: "Total Assets", value: totalAssets.toLocaleString(), trend: "+12.4%", up: true, icon: Package, color: "#D4AF37" },
          { label: "Total Value", value: formatCurrency(totalValue * 15), trend: "+8.2%", up: true, icon: DollarSign, color: "#22c55e" },
          { label: "Active Sites", value: SITES.filter(s => s.status === "Active").length, trend: "0%", up: true, icon: MapPin, color: "#3b82f6" },
          { label: "Pending Transfers", value: TRANSFERS.filter(t => t.status !== "Completed").length, trend: "-2", up: false, icon: Truck, color: "#f59e0b" },
        ].map((kpi, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-card-top">
              <div className="kpi-icon" style={{ background: `${kpi.color}12` }}>
                <kpi.icon size={22} color={kpi.color} />
              </div>
              <span className="kpi-trend" style={{ color: kpi.up ? "#22c55e" : "#ef4444" }}>
                <TrendingUp size={12} style={{ transform: kpi.up ? "none" : "rotate(180deg)" }} />
                {kpi.trend}
              </span>
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3>Asset Acquisition & Disposal Trends</h3>
            <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#D4AF37" }}></span> Acquisitions</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#ef4444" }}></span> Disposals</span>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: "Neuton" }} />
                <YAxis tick={{ fontSize: 12, fontFamily: "Neuton" }} />
                <Tooltip contentStyle={{ fontFamily: "Neuton", borderRadius: 8, border: "1px solid #e5e5e5" }} />
                <Area type="monotone" dataKey="acquisitions" stroke="#D4AF37" fill="#D4AF3720" strokeWidth={2} />
                <Area type="monotone" dataKey="disposals" stroke="#ef4444" fill="#ef444420" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Status Distribution</h3></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: "Neuton", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
              {PIE_DATA.map((e, i) => (
                <span key={i} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.color }}></span>
                  {e.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid-equal">
        <div className="card">
          <div className="card-header"><h3>Assets by Category</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CATEGORY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "Neuton" }} />
                <YAxis tick={{ fontSize: 12, fontFamily: "Neuton" }} />
                <Tooltip contentStyle={{ fontFamily: "Neuton", borderRadius: 8 }} />
                <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Alerts & Notifications</h3></div>
          <div className="card-body">
            {ALERTS.map((a, i) => (
              <div key={i} className={`alert-item alert-${a.severity}`}>
                <AlertTriangle size={16} />
                <span>{a.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="charts-grid-equal">
        <div className="card">
          <div className="card-header">
            <h3>Site Overview</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setPage("sites")}>View All</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Site</th><th>Location</th><th>Assets</th><th>Status</th></tr></thead>
              <tbody>
                {SITES.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{s.name}</td>
                    <td style={{ color: "#737373" }}>{s.city}, {s.country}</td>
                    <td>{s.assets.toLocaleString()}</td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Recent Activity</h3></div>
          <div className="card-body">
            {AUDIT_LOG.slice(0, 5).map((a, i) => (
              <div key={i} className="activity-item">
                <span className="activity-dot" style={{ background: a.action === "CREATE" ? "#22c55e" : a.action === "TRANSFER" ? "#D4AF37" : a.action === "ALERT" ? "#ef4444" : "#3b82f6" }}></span>
                <div>
                  <div className="activity-text">
                    <strong>{a.user}</strong> {a.action === "CREATE" ? "created" : a.action === "TRANSFER" ? "transferred" : a.action === "ALERT" ? "triggered alert for" : "updated"} <strong>{a.asset}</strong>
                    {a.field !== "N/A" && a.from ? ` — ${a.field}: ${a.from} → ${a.to}` : ""}
                  </div>
                  <div className="activity-time">{a.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== ASSET REGISTER ====================
const AssetRegister = ({ setSelectedAsset }) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const categories = ["All", "Hardware", "Network", "Peripheral", "Software", "License"];

  const filtered = ASSETS.filter(a =>
    (filter === "All" || a.category === filter) &&
    (search === "" || a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()) || a.serial.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="toolbar">
        <div className="filter-chips">
          {categories.map(c => (
            <button key={c} className={`chip ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
        <div className="toolbar-actions">
          <div className="search-box" style={{ width: 240 }}>
            <Search size={15} color="#a3a3a3" />
            <input placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-outline btn-sm"><Filter size={14} /> Filter</button>
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
          <button className="btn btn-outline btn-sm"><Upload size={14} /> Bulk Upload</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}><Plus size={14} /> Add Asset</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Site</th>
                <th>Status</th>
                <th>Condition</th>
                <th>Value</th>
                <th>Custodian</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const Icon = TYPE_ICONS[a.type] || Monitor;
                return (
                  <tr key={i} style={{ cursor: "pointer" }} onClick={() => setSelectedAsset(a)}>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "#D4AF37", fontWeight: 700 }}>{a.id}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon size={16} color="#737373" />
                        <span style={{ fontWeight: 700 }}>{a.name}</span>
                      </div>
                    </td>
                    <td>{a.category}</td>
                    <td>{a.type}</td>
                    <td>{a.site}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td><ConditionBadge condition={a.condition} /></td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(a.currentValue)}</td>
                    <td>{a.custodian}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn-icon" onClick={() => setSelectedAsset(a)}><Eye size={14} /></button>
                        <button className="btn-icon"><Edit size={14} /></button>
                        <button className="btn-icon"><MoreVertical size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#737373" }}>
          <span>Showing {filtered.length} of {ASSETS.length} assets</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-icon"><ChevronLeft size={14} /></button>
            <button className="btn-icon" style={{ background: "#D4AF37", color: "#0A0A0A", borderColor: "#D4AF37", fontWeight: 700, fontSize: 12 }}>1</button>
            <button className="btn-icon" style={{ fontSize: 12 }}>2</button>
            <button className="btn-icon" style={{ fontSize: 12 }}>3</button>
            <button className="btn-icon"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Asset</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Asset Category</label>
                  <select className="form-input"><option>Hardware</option><option>Network</option><option>Peripheral</option><option>Software</option><option>License</option></select>
                </div>
                <div className="form-group">
                  <label className="form-label">Asset Type</label>
                  <select className="form-input"><option>Laptop</option><option>Desktop</option><option>Server</option><option>Switch</option><option>Monitor</option></select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Asset Name</label>
                <input className="form-input" placeholder="e.g. Dell Latitude 5540" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Serial Number</label>
                  <input className="form-input" placeholder="Manufacturer serial" />
                </div>
                <div className="form-group">
                  <label className="form-label">Asset Tag</label>
                  <input className="form-input" placeholder="MGY-XXXXXX" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Manufacturer</label>
                  <input className="form-input" placeholder="e.g. Dell, HP, Cisco" />
                </div>
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input className="form-input" placeholder="Model number" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Site</label>
                  <select className="form-input">{SITES.map(s => <option key={s.id}>{s.name}</option>)}</select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-input"><option>IT</option><option>Engineering</option><option>Finance</option><option>Operations</option><option>Admin</option></select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Purchase Date</label>
                  <input className="form-input" type="date" />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Value ($)</label>
                  <input className="form-input" type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Warranty Expiration</label>
                <input className="form-input" type="date" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowAddModal(false)}>Create Asset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== ASSET DETAIL PANEL ====================
const AssetDetail = ({ asset, onClose }) => {
  if (!asset) return null;
  const Icon = TYPE_ICONS[asset.type] || Monitor;
  const lifecycleStages = ["Procurement", "Deployment", "Maintenance", "Retirement", "Disposal"];
  const currentStageIdx = lifecycleStages.indexOf(asset.lifecycle);

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#D4AF3712", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} color="#D4AF37" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{asset.name}</h2>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#D4AF37" }}>{asset.id}</span>
            </div>
          </div>
        </div>
        <button className="btn-icon" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="detail-body">
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <StatusBadge status={asset.status} />
          <ConditionBadge condition={asset.condition} />
        </div>

        <div className="detail-section">
          <h4>Lifecycle Stage</h4>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, color: "#a3a3a3" }}>
            {lifecycleStages.map(s => <span key={s} style={{ color: lifecycleStages.indexOf(s) <= currentStageIdx ? "#D4AF37" : undefined }}>{s}</span>)}
          </div>
          <div className="lifecycle-bar">
            {lifecycleStages.map((s, i) => (
              <div key={i} className={`lifecycle-step ${i < currentStageIdx ? "completed" : i === currentStageIdx ? "active" : ""}`}></div>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h4>General Information</h4>
          {[
            ["Asset Tag", asset.tag],
            ["Category", asset.category],
            ["Type", asset.type],
            ["Serial Number", asset.serial],
            ["Manufacturer", asset.manufacturer],
            ["Model", asset.model],
            ["Operating System", asset.os],
            ["Risk Level", null],
          ].map(([l, v], i) => (
            <div className="detail-row" key={i}>
              <span className="detail-label">{l}</span>
              <span className="detail-value">{l === "Risk Level" ? <RiskBadge risk={asset.risk} /> : v}</span>
            </div>
          ))}
        </div>

        <div className="detail-section">
          <h4>Location & Assignment</h4>
          {[
            ["Site", asset.site],
            ["Department", asset.department],
            ["Custodian", asset.custodian],
          ].map(([l, v], i) => (
            <div className="detail-row" key={i}>
              <span className="detail-label">{l}</span>
              <span className="detail-value" style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="detail-section">
          <h4>Financial Information</h4>
          {[
            ["Purchase Date", asset.purchaseDate],
            ["Purchase Value", formatCurrency(asset.value)],
            ["Current Value", formatCurrency(asset.currentValue)],
            ["Depreciation", formatCurrency(asset.value - asset.currentValue)],
            ["Warranty Exp.", asset.warrantyExp],
          ].map(([l, v], i) => (
            <div className="detail-row" key={i}>
              <span className="detail-label">{l}</span>
              <span className="detail-value" style={{ fontWeight: l.includes("Value") ? 700 : 400, color: l === "Warranty Exp." && new Date(asset.warrantyExp) < new Date("2025-06-01") ? "#ef4444" : undefined }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          <button className="btn btn-primary btn-sm"><Edit size={14} /> Edit Asset</button>
          <button className="btn btn-outline btn-sm"><ArrowLeftRight size={14} /> Transfer</button>
          <button className="btn btn-outline btn-sm"><Wrench size={14} /> Repair</button>
          <button className="btn btn-outline btn-sm" style={{ color: "#ef4444", borderColor: "#fca5a5" }}><Trash2 size={14} /> Dispose</button>
        </div>
      </div>
    </div>
  );
};

// ==================== TRANSFERS ====================
const TransferManagement = () => (
  <div>
    <div className="toolbar">
      <div className="filter-chips">
        {["All", "Pending Approval", "In Transit", "Completed", "Rejected"].map(f => (
          <button key={f} className={`chip ${f === "All" ? "active" : ""}`}>{f}</button>
        ))}
      </div>
      <button className="btn btn-primary btn-sm"><Plus size={14} /> New Transfer</button>
    </div>
    <div className="card">
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Transfer ID</th><th>Assets</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Date</th><th>Initiator</th><th>Actions</th></tr></thead>
          <tbody>
            {TRANSFERS.map((t, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "monospace", fontSize: 12, color: "#D4AF37", fontWeight: 700 }}>{t.id}</td>
                <td>{t.assets.length} asset{t.assets.length > 1 ? "s" : ""}</td>
                <td>{t.from}</td>
                <td>{t.to}</td>
                <td>{t.reason}</td>
                <td><StatusBadge status={t.status} /></td>
                <td>{t.date}</td>
                <td>{t.initiator}</td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn-icon"><Eye size={14} /></button>
                    {t.status === "Pending Approval" && <button className="btn btn-primary btn-sm" style={{ padding: "4px 10px", fontSize: 12 }}>Approve</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ==================== REPAIRS ====================
const RepairManagement = () => (
  <div>
    <div className="toolbar">
      <div className="filter-chips">
        {["All", "In Progress", "Diagnosed", "Awaiting Parts", "Completed"].map(f => (
          <button key={f} className={`chip ${f === "All" ? "active" : ""}`}>{f}</button>
        ))}
      </div>
      <button className="btn btn-primary btn-sm"><Plus size={14} /> New Repair Ticket</button>
    </div>
    <div className="card">
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Ticket ID</th><th>Asset</th><th>Issue</th><th>Vendor</th><th>Cost</th><th>Status</th><th>Urgency</th><th>Expected</th><th>Actions</th></tr></thead>
          <tbody>
            {REPAIRS.map((r, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "monospace", fontSize: 12, color: "#D4AF37", fontWeight: 700 }}>{r.id}</td>
                <td style={{ fontWeight: 700 }}>{r.asset}</td>
                <td style={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis" }}>{r.issue}</td>
                <td>{r.vendor}</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(r.cost)}</td>
                <td><StatusBadge status={r.status} /></td>
                <td><RiskBadge risk={r.urgency} /></td>
                <td>{r.expected}</td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn-icon"><Eye size={14} /></button>
                    <button className="btn-icon"><Edit size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ==================== REPORTS ====================
const Reports = () => {
  const [activeTab, setActiveTab] = useState("register");
  const reports = [
    { id: "register", name: "Asset Register", icon: Clipboard, desc: "Complete inventory by site, department, status" },
    { id: "acquisition", name: "Acquisition Report", icon: TrendingUp, desc: "New assets by date range, vendor, category" },
    { id: "disposal", name: "Disposal Report", icon: Trash2, desc: "Retired assets with financial impact" },
    { id: "transfer", name: "Transfer History", icon: ArrowLeftRight, desc: "All movements between sites" },
    { id: "warranty", name: "Warranty Expiry", icon: Shield, desc: "Upcoming expirations (30/60/90 days)" },
    { id: "financial", name: "Financial Summary", icon: DollarSign, desc: "Total valuation, depreciation, ROI" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {reports.map(r => (
          <div key={r.id} className="card" style={{ cursor: "pointer", transition: "all 0.2s" }} onClick={() => setActiveTab(r.id)}>
            <div className="card-body" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: activeTab === r.id ? "#D4AF3720" : "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <r.icon size={20} color={activeTab === r.id ? "#D4AF37" : "#737373"} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{r.name}</h3>
                <p style={{ fontSize: 13, color: "#737373", lineHeight: 1.4 }}>{r.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>{reports.find(r => r.id === activeTab)?.name} — Preview</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline btn-sm"><Filter size={14} /> Filters</button>
            <button className="btn btn-outline btn-sm"><Download size={14} /> Export PDF</button>
            <button className="btn btn-primary btn-sm"><Download size={14} /> Export Excel</button>
          </div>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: "Neuton" }} />
              <YAxis tick={{ fontSize: 12, fontFamily: "Neuton" }} />
              <Tooltip contentStyle={{ fontFamily: "Neuton", borderRadius: 8 }} />
              <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Value ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==================== AUDIT LOG ====================
const AuditLog = () => (
  <div>
    <div className="toolbar">
      <div className="filter-chips">
        {["All Actions", "CREATE", "UPDATE", "TRANSFER", "DELETE", "ALERT"].map(f => (
          <button key={f} className={`chip ${f === "All Actions" ? "active" : ""}`}>{f}</button>
        ))}
      </div>
      <div className="toolbar-actions">
        <button className="btn btn-outline btn-sm"><Download size={14} /> Export Log</button>
      </div>
    </div>
    <div className="card">
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Asset</th><th>Field</th><th>Previous</th><th>New Value</th></tr></thead>
          <tbody>
            {AUDIT_LOG.map((a, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{a.timestamp}</td>
                <td style={{ fontWeight: 700 }}>{a.user}</td>
                <td>
                  <span style={{
                    padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                    background: a.action === "CREATE" ? "#dcfce7" : a.action === "TRANSFER" ? "#fef3c7" : a.action === "DELETE" ? "#fef2f2" : a.action === "ALERT" ? "#fef2f2" : "#dbeafe",
                    color: a.action === "CREATE" ? "#16a34a" : a.action === "TRANSFER" ? "#d97706" : a.action === "DELETE" ? "#dc2626" : a.action === "ALERT" ? "#dc2626" : "#2563eb",
                  }}>{a.action}</span>
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 12, color: "#D4AF37" }}>{a.asset}</td>
                <td>{a.field}</td>
                <td style={{ color: "#737373" }}>{a.from || "—"}</td>
                <td style={{ fontWeight: 700 }}>{a.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ==================== SITES MANAGEMENT ====================
const SiteManagement = () => (
  <div>
    <div className="toolbar">
      <div></div>
      <button className="btn btn-primary btn-sm"><Plus size={14} /> Add Site</button>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
      {SITES.map((s, i) => (
        <div key={i} className="card" style={{ cursor: "pointer" }}>
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{s.name}</h3>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#D4AF37" }}>{s.id}</span>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
              <div><span style={{ color: "#a3a3a3", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Location</span><div style={{ fontWeight: 700 }}>{s.city}, {s.country}</div></div>
              <div><span style={{ color: "#a3a3a3", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Total Assets</span><div style={{ fontWeight: 700, fontSize: 22 }}>{s.assets.toLocaleString()}</div></div>
              <div><span style={{ color: "#a3a3a3", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Site Manager</span><div>{s.manager}</div></div>
              <div><span style={{ color: "#a3a3a3", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Departments</span><div>5 active</div></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ==================== USERS ====================
const UserManagement = () => {
  const users = [
    { name: "Tatenda Moyo", email: "t.moyo@magayamining.co.zw", role: "Super Administrator", sites: "All Sites", status: "Active", lastLogin: "2024-06-25 14:32" },
    { name: "Chipo Ndlovu", email: "c.ndlovu@magayamining.co.zw", role: "Site Administrator", sites: "Magaya HQ, Shamva Mine", status: "Active", lastLogin: "2024-06-25 13:15" },
    { name: "Farai Madziva", email: "f.madziva@magayamining.co.zw", role: "IT Asset Manager", sites: "Penhalonga Operations", status: "Active", lastLogin: "2024-06-25 11:45" },
    { name: "Rudo Chipanga", email: "r.chipanga@magayamining.co.zw", role: "IT Technician", sites: "Kwekwe Processing", status: "Active", lastLogin: "2024-06-24 16:20" },
    { name: "Simba Gumbo", email: "s.gumbo@magayamining.co.zw", role: "Auditor", sites: "All Sites", status: "Active", lastLogin: "2024-06-23 09:05" },
  ];

  return (
    <div>
      <div className="toolbar">
        <div className="filter-chips">
          {["All Roles", "Super Admin", "Site Admin", "Asset Manager", "Technician", "Auditor"].map(f => (
            <button key={f} className={`chip ${f === "All Roles" ? "active" : ""}`}>{f}</button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm"><Plus size={14} /> Add User</button>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>User</th><th>Role</th><th>Sites</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{u.name.split(" ").map(n => n[0]).join("")}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: "#737373" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: u.role.includes("Super") ? "#D4AF3720" : "#f5f5f5", color: u.role.includes("Super") ? "#D4AF37" : "#525252" }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{u.sites}</td>
                  <td><StatusBadge status={u.status} /></td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{u.lastLogin}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn-icon"><Edit size={14} /></button>
                      <button className="btn-icon"><MoreVertical size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================
export default function MagayaITAM() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [currentSite, setCurrentSite] = useState("All Sites");

  const navItems = [
    { section: "Main", items: [
      { id: "dashboard", label: "Dashboard", icon: Home },
      { id: "assets", label: "Asset Register", icon: Package, badge: ASSETS.length },
      { id: "transfers", label: "Transfers", icon: Truck, badge: 2 },
      { id: "repairs", label: "Repairs", icon: Wrench, badge: 3 },
    ]},
    { section: "Management", items: [
      { id: "sites", label: "Sites", icon: MapPin },
      { id: "users", label: "Users & Roles", icon: Users },
      { id: "reports", label: "Reports", icon: BarChartIcon },
      { id: "audit", label: "Audit Trail", icon: Clipboard },
    ]},
    { section: "System", items: [
      { id: "settings", label: "Settings", icon: Settings },
    ]},
  ];

  const pageTitle = {
    dashboard: "Dashboard", assets: "Asset Register", transfers: "Transfer Management",
    repairs: "Repair Management", sites: "Site Management", users: "Users & Roles",
    reports: "Reports & Analytics", audit: "Audit Trail", settings: "System Settings",
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <img src={LOGO_ICON} alt="Magaya Mining" />
            <div className="sidebar-logo-text">
              <h2>Magaya Mining</h2>
              <span>Asset Manager</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((section, si) => (
              <div key={si} className="sidebar-section">
                <div className="sidebar-section-title">{section.section}</div>
                {section.items.map(item => (
                  <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`}
                    onClick={() => { setPage(item.id); setSidebarOpen(false); setSelectedAsset(null); }}>
                    <item.icon />
                    <span>{item.label}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-footer-avatar">TM</div>
            <div className="sidebar-footer-info">
              <div className="name">Tatenda Moyo</div>
              <div className="role">Super Administrator</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
          <header className="header">
            <div className="header-left">
              <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={22} /></button>
              <div>
                <div className="header-title">{pageTitle[page]}</div>
                <div className="header-breadcrumb">
                  <span>Magaya Mining</span>
                  <ChevronRight size={12} />
                  <span style={{ color: "#D4AF37" }}>{pageTitle[page]}</span>
                </div>
              </div>
            </div>
            <div className="header-right">
              <div className="search-box">
                <Search size={15} color="#a3a3a3" />
                <input placeholder="Search anything..." />
              </div>
              <select className="site-switcher" value={currentSite} onChange={e => setCurrentSite(e.target.value)}>
                <option>All Sites</option>
                {SITES.map(s => <option key={s.id}>{s.name}</option>)}
              </select>
              <button className="header-btn">
                <Bell size={18} />
                <span className="badge">4</span>
              </button>
              <div className="user-avatar">TM</div>
            </div>
          </header>

          <div className="page-content">
            {page === "dashboard" && <Dashboard setPage={setPage} setSelectedAsset={setSelectedAsset} />}
            {page === "assets" && <AssetRegister setSelectedAsset={setSelectedAsset} />}
            {page === "transfers" && <TransferManagement />}
            {page === "repairs" && <RepairManagement />}
            {page === "reports" && <Reports />}
            {page === "audit" && <AuditLog />}
            {page === "sites" && <SiteManagement />}
            {page === "users" && <UserManagement />}
            {page === "settings" && (
              <div className="card">
                <div className="card-body" style={{ padding: 40 }}>
                  <div className="empty-state">
                    <Settings size={48} />
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#0A0A0A" }}>System Settings</h3>
                    <p>Configure organization preferences, integrations, and system parameters.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Asset Detail Slide-out */}
        {selectedAsset && <AssetDetail asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
      </div>
    </>
  );
}
