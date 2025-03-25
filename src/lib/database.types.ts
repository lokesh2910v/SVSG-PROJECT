export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          user_type: 'Admin' | 'Filler' | 'Dispatcher'
          email: string
          password: string
          age: number
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          user_type: 'Admin' | 'Filler' | 'Dispatcher'
          email: string
          password: string
          age: number
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          user_type?: 'Admin' | 'Filler' | 'Dispatcher'
          email?: string
          password?: string
          age?: number
          created_at?: string | null
        }
      }
      cylinders: {
        Row: {
          serial_number: string
          status: 'empty' | 'ordered' | 'filled' | 'dispatched' | 'delivered' | 'assigned_pickup' | 'pickup_done'
          location: 'Warehouse' | 'Customer'
          order_id: string | null
          created_at: string | null
        }
        Insert: {
          serial_number: string
          status?: 'empty' | 'ordered' | 'filled' | 'dispatched' | 'delivered' | 'assigned_pickup' | 'pickup_done'
          location?: 'Warehouse' | 'Customer'
          order_id?: string | null
          created_at?: string | null
        }
        Update: {
          serial_number?: string
          status?: 'empty' | 'ordered' | 'filled' | 'dispatched' | 'delivered' | 'assigned_pickup' | 'pickup_done'
          location?: 'Warehouse' | 'Customer'
          order_id?: string | null
          created_at?: string | null
        }
      }
      orders: {
        Row: {
          order_id: string
          customer_name: string
          customer_phone: string
          customer_address: string
          cylinder_serial: string | null
          order_date: string | null
          status: 'Ordered' | 'Filled' | 'Dispatched' | 'Delivered'
        }
        Insert: {
          order_id?: string
          customer_name: string
          customer_phone: string
          customer_address: string
          cylinder_serial?: string | null
          order_date?: string | null
          status?: 'Ordered' | 'Filled' | 'Dispatched' | 'Delivered'
        }
        Update: {
          order_id?: string
          customer_name?: string
          customer_phone?: string
          customer_address?: string
          cylinder_serial?: string | null
          order_date?: string | null
          status?: 'Ordered' | 'Filled' | 'Dispatched' | 'Delivered'
        }
      }
      pickups: {
        Row: {
          pickup_id: string
          cylinder_serial: string | null
          customer_name: string
          customer_phone: string
          customer_address: string
          pickup_status: 'Assigned Pickup' | 'Pickup Done'
          created_at: string | null
        }
        Insert: {
          pickup_id?: string
          cylinder_serial?: string | null
          customer_name: string
          customer_phone: string
          customer_address: string
          pickup_status?: 'Assigned Pickup' | 'Pickup Done'
          created_at?: string | null
        }
        Update: {
          pickup_id?: string
          cylinder_serial?: string | null
          customer_name?: string
          customer_phone?: string
          customer_address: string
          pickup_status?: 'Assigned Pickup' | 'Pickup Done'
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type_enum: 'Admin' | 'Filler' | 'Dispatcher'
      cylinder_status_enum: 'empty' | 'ordered' | 'filled' | 'dispatched' | 'delivered' | 'assigned_pickup' | 'pickup_done'
      cylinder_location_enum: 'Warehouse' | 'Customer'
      order_status_enum: 'Ordered' | 'Filled' | 'Dispatched' | 'Delivered'
      pickup_status_enum: 'Assigned Pickup' | 'Pickup Done'
    }
  }
}