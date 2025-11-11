import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  role: string;
  fullName?: string;
  password?: string;
  companyName?: string;
  brandName?: string;
  industry?: string;
  companySize?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roles, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roles) {
      throw new Error("Unauthorized: Admin access required");
    }

    const { email, role, fullName, password, companyName, brandName, industry, companySize }: CreateUserRequest = await req.json();

    // Validate role
    const validRoles = ["admin", "marketing", "content", "assets", "user"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    // Create the user using admin API
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password: password || Math.random().toString(36).slice(-12),
      email_confirm: true,
      user_metadata: {
        full_name: fullName || email.split("@")[0],
        company_name: companyName,
        brand_name: brandName,
        industry,
        company_size: companySize,
      },
    });

    if (createError) {
      throw createError;
    }

    // Assign role to the user
    const { error: roleInsertError } = await supabaseClient
      .from("user_roles")
      .insert({
        user_id: newUser.user.id,
        role: role,
      });

    if (roleInsertError) {
      // If role assignment fails, we should ideally rollback user creation
      // For now, log the error
      console.error("Failed to assign role:", roleInsertError);
      throw new Error("User created but role assignment failed");
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: newUser.user,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
