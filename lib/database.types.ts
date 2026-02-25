// =============================================================================
// AUTO-GENERATED TYPES - Run `npm run db:types` to regenerate
// =============================================================================
// This file is a placeholder. After setting up Supabase, run:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      sites: {
        Row: {
          id: string;
          org_id: string;
          site_code: string;
          name: string;
          address: string | null;
          city: string | null;
          state_region: string | null;
          country: string | null;
          postal_code: string | null;
          timezone: string;
          status: 'active' | 'inactive' | 'maintenance';
          logo_url: string | null;
          manager_name: string | null;
          manager_email: string | null;
          manager_phone: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sites']['Row'], 'id' | 'site_code' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sites']['Insert']>;
      };
      departments: {
        Row: {
          id: string;
          site_id: string;
          name: string;
          code: string | null;
          head_user_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['departments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['departments']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: 'super_admin' | 'site_admin' | 'asset_manager' | 'technician' | 'auditor';
          org_id: string;
          phone: string | null;
          is_active: boolean;
          last_login: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      user_site_access: {
        Row: {
          id: string;
          user_id: string;
          site_id: string;
          is_default: boolean;
          granted_at: string;
          granted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['user_site_access']['Row'], 'id' | 'granted_at'>;
        Update: Partial<Database['public']['Tables']['user_site_access']['Insert']>;
      };
      assets: {
        Row: {
          id: string;
          asset_code: string;
          asset_tag: string;
          category: 'hardware' | 'software' | 'network' | 'peripheral' | 'license' | 'component';
          asset_type: string;
          name: string;
          serial_number: string;
          manufacturer: string | null;
          model: string | null;
          specifications: Json;
          hostname: string | null;
          ip_address: string | null;
          mac_address: string | null;
          antivirus: string | null;
          operating_system: string | null;
          purchase_date: string | null;
          purchase_order: string | null;
          vendor: string | null;
          purchase_value: number;
          current_value: number;
          warranty_expiration: string | null;
          depreciation_method: 'straight_line' | 'double_declining' | 'none';
          status: 'active' | 'in_storage' | 'deployed' | 'under_repair' | 'retired' | 'disposed' | 'sold' | 'damaged' | 'lost';
          condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor' | 'non_functional';
          site_id: string;
          department_id: string | null;
          section: string | null;
          custodian_id: string | null;
          previous_custodian_id: string | null;
          assigned_date: string | null;
          lifecycle_stage: 'procurement' | 'deployment' | 'maintenance' | 'retirement' | 'disposal';
          risk_level: 'critical' | 'high' | 'medium' | 'low';
          compliance_tags: string[];
          disposal_method: string | null;
          insurance_policy: string | null;
          lease_id: string | null;
          network_zone: string | null;
          notes: string | null;
          custom_fields: Json;
          org_id: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assets']['Row'], 'id' | 'asset_code' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['assets']['Insert']>;
      };
      transfers: {
        Row: {
          id: string;
          transfer_code: string;
          from_site_id: string;
          to_site_id: string;
          status: 'pending' | 'approved' | 'in_transit' | 'received' | 'completed' | 'rejected' | 'cancelled';
          reason: string;
          notes: string | null;
          carrier: string | null;
          tracking_number: string | null;
          expected_delivery: string | null;
          departure_condition: Json;
          arrival_condition: Json;
          initiated_by: string;
          approved_by: string | null;
          received_by: string | null;
          org_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transfers']['Row'], 'id' | 'transfer_code' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['transfers']['Insert']>;
      };
      transfer_items: {
        Row: {
          id: string;
          transfer_id: string;
          asset_id: string;
        };
        Insert: Omit<Database['public']['Tables']['transfer_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['transfer_items']['Insert']>;
      };
      repairs: {
        Row: {
          id: string;
          repair_code: string;
          asset_id: string;
          issue_description: string;
          urgency: 'critical' | 'high' | 'medium' | 'low';
          repair_type: 'in_house' | 'external';
          vendor: string | null;
          status: 'reported' | 'diagnosed' | 'awaiting_parts' | 'in_progress' | 'completed' | 'cancelled';
          estimated_cost: number;
          actual_cost: number | null;
          parts_cost: number | null;
          labor_cost: number | null;
          shipping_cost: number | null;
          expected_completion: string | null;
          actual_completion: string | null;
          notes: string | null;
          reported_by: string;
          org_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['repairs']['Row'], 'id' | 'repair_code' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['repairs']['Insert']>;
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: 'create' | 'update' | 'delete' | 'transfer' | 'login' | 'logout' | 'export' | 'alert';
          entity_type: string;
          entity_id: string | null;
          changes: Json;
          ip_address: string | null;
          user_agent: string | null;
          org_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      attachments: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          file_name: string;
          file_url: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['attachments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['attachments']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
