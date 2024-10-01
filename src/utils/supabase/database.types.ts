export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            graphql: {
                Args: {
                    operationName?: string;
                    query?: string;
                    variables?: Json;
                    extensions?: Json;
                };
                Returns: Json;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    public: {
        Tables: {
            achievement: {
                Row: {
                    achievement_desc: string;
                    achievement_id: string;
                    achievement_name: string;
                };
                Insert: {
                    achievement_desc: string;
                    achievement_id?: string;
                    achievement_name: string;
                };
                Update: {
                    achievement_desc?: string;
                    achievement_id?: string;
                    achievement_name?: string;
                };
                Relationships: [];
            };
            profile: {
                Row: {
                    email: string;
                    first_name: string;
                    last_name: string;
                    profile_avatar: string | null;
                    profile_bio: string | null;
                    profile_display_name: string | null;
                    user_id: string;
                };
                Insert: {
                    email: string;
                    first_name?: string;
                    last_name?: string;
                    profile_avatar?: string | null;
                    profile_bio?: string | null;
                    profile_display_name?: string | null;
                    user_id: string;
                };
                Update: {
                    email?: string;
                    first_name?: string;
                    last_name?: string;
                    profile_avatar?: string | null;
                    profile_bio?: string | null;
                    profile_display_name?: string | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "profile_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: true;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            project: {
                Row: {
                    project_desc: string | null;
                    project_id: string;
                    project_name: string;
                    project_owner_id: string;
                    project_profile_pic: string | null;
                };
                Insert: {
                    project_desc?: string | null;
                    project_id?: string;
                    project_name: string;
                    project_owner_id: string;
                    project_profile_pic?: string | null;
                };
                Update: {
                    project_desc?: string | null;
                    project_id?: string;
                    project_name?: string;
                    project_owner_id?: string;
                    project_profile_pic?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "project_project_owner_id_fkey";
                        columns: ["project_owner_id"];
                        isOneToOne: false;
                        referencedRelation: "profile";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
            project_invite_link: {
                Row: {
                    invite_created_at: string;
                    invite_creator_id: string;
                    invite_id: string;
                    project_id: string;
                };
                Insert: {
                    invite_created_at?: string;
                    invite_creator_id: string;
                    invite_id?: string;
                    project_id: string;
                };
                Update: {
                    invite_created_at?: string;
                    invite_creator_id?: string;
                    invite_id?: string;
                    project_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "project_invite_link_invite_creator_id_fkey";
                        columns: ["invite_creator_id"];
                        isOneToOne: false;
                        referencedRelation: "profile";
                        referencedColumns: ["user_id"];
                    },
                    {
                        foreignKeyName: "project_invite_link_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "project";
                        referencedColumns: ["project_id"];
                    },
                ];
            };
            project_member: {
                Row: {
                    project_id: string;
                    user_id: string;
                };
                Insert: {
                    project_id: string;
                    user_id: string;
                };
                Update: {
                    project_id?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "project_member_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "project";
                        referencedColumns: ["project_id"];
                    },
                    {
                        foreignKeyName: "project_member_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profile";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
            task: {
                Row: {
                    project_id: string;
                    task_creator_id: string | null;
                    task_deadline: string | null;
                    task_desc: string | null;
                    task_id: string;
                    task_is_meeting: boolean;
                    task_location: string | null;
                    task_name: string;
                    task_parent_id: string | null;
                    task_priority: Database["public"]["Enums"]["task_priority_enum"];
                    task_status: Database["public"]["Enums"]["task_status_enum"];
                    task_time_spent: number;
                };
                Insert: {
                    project_id: string;
                    task_creator_id?: string | null;
                    task_deadline?: string | null;
                    task_desc?: string | null;
                    task_id?: string;
                    task_is_meeting?: boolean;
                    task_location?: string | null;
                    task_name: string;
                    task_parent_id?: string | null;
                    task_priority?: Database["public"]["Enums"]["task_priority_enum"];
                    task_status?: Database["public"]["Enums"]["task_status_enum"];
                    task_time_spent?: number;
                };
                Update: {
                    project_id?: string;
                    task_creator_id?: string | null;
                    task_deadline?: string | null;
                    task_desc?: string | null;
                    task_id?: string;
                    task_is_meeting?: boolean;
                    task_location?: string | null;
                    task_name?: string;
                    task_parent_id?: string | null;
                    task_priority?: Database["public"]["Enums"]["task_priority_enum"];
                    task_status?: Database["public"]["Enums"]["task_status_enum"];
                    task_time_spent?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "task_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "project";
                        referencedColumns: ["project_id"];
                    },
                    {
                        foreignKeyName: "task_task_creator_id_fkey";
                        columns: ["task_creator_id"];
                        isOneToOne: false;
                        referencedRelation: "profile";
                        referencedColumns: ["user_id"];
                    },
                    {
                        foreignKeyName: "task_task_parent_id_fkey";
                        columns: ["task_parent_id"];
                        isOneToOne: false;
                        referencedRelation: "task";
                        referencedColumns: ["task_id"];
                    },
                ];
            };
            task_assignee: {
                Row: {
                    task_id: string;
                    user_id: string;
                };
                Insert: {
                    task_id: string;
                    user_id: string;
                };
                Update: {
                    task_id?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "task_assignee_task_id_fkey";
                        columns: ["task_id"];
                        isOneToOne: false;
                        referencedRelation: "task";
                        referencedColumns: ["task_id"];
                    },
                    {
                        foreignKeyName: "task_assignee_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profile";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
            task_reminder: {
                Row: {
                    reminder_datetime: string;
                    reminder_id: string;
                    task_id: string;
                };
                Insert: {
                    reminder_datetime: string;
                    reminder_id?: string;
                    task_id: string;
                };
                Update: {
                    reminder_datetime?: string;
                    reminder_id?: string;
                    task_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "task_reminder_task_id_fkey";
                        columns: ["task_id"];
                        isOneToOne: false;
                        referencedRelation: "task";
                        referencedColumns: ["task_id"];
                    },
                ];
            };
            user_achievement: {
                Row: {
                    achievement_id: string;
                    user_id: string;
                };
                Insert: {
                    achievement_id: string;
                    user_id: string;
                };
                Update: {
                    achievement_id?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "user_achievement_achievement_id_fkey";
                        columns: ["achievement_id"];
                        isOneToOne: false;
                        referencedRelation: "achievement";
                        referencedColumns: ["achievement_id"];
                    },
                    {
                        foreignKeyName: "user_achievement_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profile";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            task_priority_enum: "LOW" | "MEDIUM" | "HIGH";
            task_status_enum: "TODO" | "DOING" | "COMPLETE";
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
    PublicTableNameOrOptions extends
        | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
              Database[PublicTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
          Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
      ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
      ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
      ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
      ? PublicSchema["Enums"][PublicEnumNameOrOptions]
      : never;
