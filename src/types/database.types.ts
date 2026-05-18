export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ApprovalStatus = "approved" | "pending" | "rejected"
export type UserRole = "admin" | "user"
export type WorkStatus =
  | "scheduled"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled"
export type PurchasedProductStatus = "active" | "completed" | "cancelled"

type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          approval_status: ApprovalStatus
          approved_at: string | null
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          approval_status?: ApprovalStatus
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>
        Relationships: Relationship[]
      }
      login_requests: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          status: ApprovalStatus
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          review_note: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          status?: ApprovalStatus
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          review_note?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["login_requests"]["Insert"]>
        Relationships: Relationship[]
      }
      products: {
        Row: {
          id: string
          name: string
          subtitle: string | null
          description: string | null
          is_active: boolean
          sort_order: number
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subtitle?: string | null
          description?: string | null
          is_active?: boolean
          sort_order?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>
        Relationships: Relationship[]
      }
      product_items: {
        Row: {
          id: string
          product_id: string
          name: string
          price_amount: number | null
          price_label: string
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          price_amount?: number | null
          price_label: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["product_items"]["Insert"]>
        Relationships: Relationship[]
      }
      hotels: {
        Row: {
          id: string
          name: string
          owner_name: string
          business_number: string
          business_license_file_path: string | null
          owner_phone: string
          address: string
          hotel_phone: string | null
          notes: string | null
          photo_folder_url: string | null
          is_active: boolean
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_name: string
          business_number: string
          business_license_file_path?: string | null
          owner_phone: string
          address: string
          hotel_phone?: string | null
          notes?: string | null
          photo_folder_url?: string | null
          is_active?: boolean
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["hotels"]["Insert"]>
        Relationships: Relationship[]
      }
      hotel_purchased_products: {
        Row: {
          id: string
          hotel_id: string
          product_id: string
          purchased_at: string | null
          price_amount: number | null
          price_label: string | null
          status: PurchasedProductStatus
          notes: string | null
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          product_id: string
          purchased_at?: string | null
          price_amount?: number | null
          price_label?: string | null
          status?: PurchasedProductStatus
          notes?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<
          Database["public"]["Tables"]["hotel_purchased_products"]["Insert"]
        >
        Relationships: Relationship[]
      }
      work_items: {
        Row: {
          id: string
          hotel_id: string
          purchased_product_id: string | null
          product_item_id: string | null
          title: string
          description: string | null
          status: WorkStatus
          start_date: string
          end_date: string
          notes: string | null
          sort_order: number
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          purchased_product_id?: string | null
          product_item_id?: string | null
          title: string
          description?: string | null
          status?: WorkStatus
          start_date: string
          end_date: string
          notes?: string | null
          sort_order?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["work_items"]["Insert"]>
        Relationships: Relationship[]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_approved_user: { Args: Record<PropertyKey, never>; Returns: boolean }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type ProductItem = Database["public"]["Tables"]["product_items"]["Row"]
export type Hotel = Database["public"]["Tables"]["hotels"]["Row"]
export type HotelPurchasedProduct =
  Database["public"]["Tables"]["hotel_purchased_products"]["Row"]
export type WorkItem = Database["public"]["Tables"]["work_items"]["Row"]
