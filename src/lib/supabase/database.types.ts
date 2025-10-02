export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          email: string
          id: string
          last_login_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          profile_photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          profile_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          profile_photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_details: {
        Row: {
          assigned_companies: string[]
          created_at: string
          employee_id: string | null
          id: string
          position: string | null
          updated_at: string
        }
        Insert: {
          assigned_companies?: string[]
          created_at?: string
          employee_id?: string | null
          id: string
          position?: string | null
          updated_at?: string
        }
        Update: {
          assigned_companies?: string[]
          created_at?: string
          employee_id?: string | null
          id?: string
          position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      reservist_details: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          rank: string | null
          reservist_status: Database["public"]["Enums"]["reservist_status"]
          service_number: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id: string
          rank?: string | null
          reservist_status?: Database["public"]["Enums"]["reservist_status"]
          service_number: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          rank?: string | null
          reservist_status?: Database["public"]["Enums"]["reservist_status"]
          service_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservist_details_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "reservist_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_current: boolean
          mime_type: string | null
          notes: string | null
          rejection_reason: string | null
          reservist_id: string
          status: Database["public"]["Enums"]["document_status"]
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          version: number
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_current?: boolean
          mime_type?: string | null
          notes?: string | null
          rejection_reason?: string | null
          reservist_id: string
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_current?: boolean
          mime_type?: string | null
          notes?: string | null
          rejection_reason?: string | null
          reservist_id?: string
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_reservist_id_fkey"
            columns: ["reservist_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          capacity: number | null
          company: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          prerequisites: string | null
          scheduled_date: string
          status: Database["public"]["Enums"]["training_status"]
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          company?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          prerequisites?: string | null
          scheduled_date: string
          status?: Database["public"]["Enums"]["training_status"]
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          company?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          prerequisites?: string | null
          scheduled_date?: string
          status?: Database["public"]["Enums"]["training_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "training_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      training_registrations: {
        Row: {
          attended_at: string | null
          certificate_url: string | null
          completion_status: Database["public"]["Enums"]["completion_status"] | null
          created_at: string
          id: string
          notes: string | null
          reservist_id: string
          status: Database["public"]["Enums"]["registration_status"]
          training_session_id: string
          updated_at: string
        }
        Insert: {
          attended_at?: string | null
          certificate_url?: string | null
          completion_status?: Database["public"]["Enums"]["completion_status"] | null
          created_at?: string
          id?: string
          notes?: string | null
          reservist_id: string
          status?: Database["public"]["Enums"]["registration_status"]
          training_session_id: string
          updated_at?: string
        }
        Update: {
          attended_at?: string | null
          certificate_url?: string | null
          completion_status?: Database["public"]["Enums"]["completion_status"] | null
          created_at?: string
          id?: string
          notes?: string | null
          reservist_id?: string
          status?: Database["public"]["Enums"]["registration_status"]
          training_session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_registrations_reservist_id_fkey"
            columns: ["reservist_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_registrations_training_session_id_fkey"
            columns: ["training_session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          priority: Database["public"]["Enums"]["announcement_priority"]
          published_at: string | null
          target_companies: string[] | null
          target_roles: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: Database["public"]["Enums"]["announcement_priority"]
          published_at?: string | null
          target_companies?: string[] | null
          target_roles?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: Database["public"]["Enums"]["announcement_priority"]
          published_at?: string | null
          target_companies?: string[] | null
          target_roles?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          reference_id: string | null
          reference_table: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          reference_id?: string | null
          reference_table?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          reference_id?: string | null
          reference_table?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_account: {
        Args: { p_account_id: string; p_approver_id: string }
        Returns: boolean
      }
      create_account_with_profile: {
        Args: {
          p_created_by?: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_phone?: string
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_super_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_admin_or_above: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_staff_or_above: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "pending" | "active" | "inactive" | "deactivated"
      announcement_priority: "low" | "normal" | "high" | "urgent"
      audit_action: "create" | "update" | "delete" | "approve" | "reject" | "login" | "logout" | "validate"
      completion_status: "passed" | "failed" | "pending"
      document_status: "pending" | "verified" | "rejected"
      notification_type: "document" | "training" | "announcement" | "status_change" | "account" | "system"
      registration_status: "registered" | "attended" | "completed" | "cancelled" | "no_show"
      reservist_status: "ready" | "standby" | "retired"
      training_status: "scheduled" | "ongoing" | "completed" | "cancelled"
      user_role: "super_admin" | "admin" | "staff" | "reservist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
