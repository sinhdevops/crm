export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DealStage =
  | "PROSPECT"
  | "CONSULTING"
  | "VIEWING"
  | "NEGOTIATION"
  | "DEPOSIT"
  | "CLOSED_WON"
  | "CLOSED_LOST";

export type ActivityType = "CALL" | "EMAIL" | "MEETING" | "NOTE";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: "ADMIN" | "MANAGER" | "SALES_REP";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          role?: "ADMIN" | "MANAGER" | "SALES_REP";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          name?: string;
          role?: "ADMIN" | "MANAGER" | "SALES_REP";
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          zalo: string | null;
          facebook: string | null;
          company: string | null;
          position: string | null;
          customer_type: string | null;
          priority: string | null;
          gender: string | null;
          birthday: string | null;
          residence: string | null;
          area_interest: string | null;
          interest_type: string | null;
          purchase_need: string | null;
          budget_min: number | null;
          budget_max: number | null;
          decision_maker: string | null;
          work_date: string | null;
          last_contacted_date: string | null;
          next_follow_up_date: string | null;
          payment_date: string | null;
          note: string | null;
          solution_plan: string | null;
          assigned_staff: string | null;
          source: string | null;
          next_payment_date: string | null;
          post_sale_status: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          zalo?: string | null;
          facebook?: string | null;
          company?: string | null;
          position?: string | null;
          customer_type?: string | null;
          priority?: string | null;
          gender?: string | null;
          birthday?: string | null;
          residence?: string | null;
          area_interest?: string | null;
          interest_type?: string | null;
          purchase_need?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          decision_maker?: string | null;
          work_date?: string | null;
          last_contacted_date?: string | null;
          next_follow_up_date?: string | null;
          payment_date?: string | null;
          note?: string | null;
          solution_plan?: string | null;
          assigned_staff?: string | null;
          source?: string | null;
          next_payment_date?: string | null;
          post_sale_status?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          name?: string;
          email?: string | null;
          phone?: string | null;
          zalo?: string | null;
          facebook?: string | null;
          company?: string | null;
          position?: string | null;
          customer_type?: string | null;
          priority?: string | null;
          gender?: string | null;
          birthday?: string | null;
          residence?: string | null;
          area_interest?: string | null;
          interest_type?: string | null;
          purchase_need?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          decision_maker?: string | null;
          work_date?: string | null;
          last_contacted_date?: string | null;
          next_follow_up_date?: string | null;
          payment_date?: string | null;
          note?: string | null;
          solution_plan?: string | null;
          assigned_staff?: string | null;
          source?: string | null;
          next_payment_date?: string | null;
          post_sale_status?: string | null;
          image_url?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          user_id: string;
          contact_id: string;
          title: string;
          value: number;
          stage: DealStage;
          probability: number;
          priority: string | null;
          lead_source: string | null;
          property_project: string | null;
          property_type: string | null;
          property_code: string | null;
          property_area: string | null;
          appointment_date: string | null;
          lost_reason: string | null;
          close_date: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          contact_id: string;
          title: string;
          value?: number;
          stage?: DealStage;
          probability?: number;
          priority?: string | null;
          lead_source?: string | null;
          property_project?: string | null;
          property_type?: string | null;
          property_code?: string | null;
          property_area?: string | null;
          appointment_date?: string | null;
          lost_reason?: string | null;
          close_date?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          contact_id?: string;
          title?: string;
          value?: number;
          stage?: DealStage;
          probability?: number;
          priority?: string | null;
          lead_source?: string | null;
          property_project?: string | null;
          property_type?: string | null;
          property_code?: string | null;
          property_area?: string | null;
          appointment_date?: string | null;
          lost_reason?: string | null;
          close_date?: string | null;
          note?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          contact_id: string | null;
          deal_id: string | null;
          type: ActivityType;
          title: string | null;
          note: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contact_id?: string | null;
          deal_id?: string | null;
          type: ActivityType;
          title?: string | null;
          note: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          contact_id?: string | null;
          deal_id?: string | null;
          type?: ActivityType;
          title?: string | null;
          note?: string;
          date?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          deal_id: string;
          title: string;
          done: boolean;
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deal_id: string;
          title: string;
          done?: boolean;
          due_date?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          done?: boolean;
          due_date?: string | null;
        };
        Relationships: [];
      };
      ai_suggestions: {
        Row: {
          id: string;
          user_id: string;
          deal_id: string;
          type: "TASK_LIST" | "EMAIL_DRAFT" | "SUMMARY";
          content: string;
          source_note: string | null;
          job_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deal_id: string;
          type: "TASK_LIST" | "EMAIL_DRAFT" | "SUMMARY";
          content: string;
          source_note?: string | null;
          job_id?: string | null;
          created_at?: string;
        };
        Update: {
          type?: "TASK_LIST" | "EMAIL_DRAFT" | "SUMMARY";
          content?: string;
          source_note?: string | null;
          job_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
