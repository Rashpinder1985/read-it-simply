import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RoleAssignment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const defaultPassword = "Welcome@123";
  
  const usersToCreate = [
    { email: "yogesh@digitaldogscorp.com", role: "admin", fullName: "Yogesh" },
    { email: "ambarish@digitaldogscorp.com", role: "admin", fullName: "Ambarish" },
    { email: "yogesh@digitaldogscorp.in", role: "marketing", fullName: "Yogesh Marketing" },
    { email: "ambarish@digitaldogscorp.in", role: "content", fullName: "Ambarish Content" },
    { email: "goldy13guri@gmail.com", role: "assets", fullName: "Goldy" },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const createUsersWithRoles = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    for (const user of usersToCreate) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              email: user.email,
              role: user.role,
              fullName: user.fullName,
              password: defaultPassword,
            }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          toast({
            title: "Success",
            description: `Created ${user.email} with ${user.role} role`,
          });
        } else {
          toast({
            title: "Error",
            description: result.error || `Failed to create ${user.email}`,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }

    setLoading(false);
    toast({
      title: "Complete",
      description: "Role assignment process completed",
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Assign User Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Users to be created:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>yogesh@digitaldogscorp.com - <strong>Admin</strong></li>
              <li>ambarish@digitaldogscorp.com - <strong>Admin</strong></li>
              <li>yogesh@digitaldogscorp.in - <strong>Marketing</strong> Manager</li>
              <li>ambarish@digitaldogscorp.in - <strong>Content</strong> Manager</li>
              <li>goldy13guri@gmail.com - <strong>Assets</strong> Manager</li>
            </ul>
          </div>
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm font-semibold mb-1">Default Password:</p>
            <code className="text-sm bg-background px-2 py-1 rounded">{defaultPassword}</code>
            <p className="text-xs text-muted-foreground mt-2">
              All users will be created with this password. Please change it after first login.
            </p>
          </div>
          <Button 
            onClick={createUsersWithRoles} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating Users..." : "Create Users with Roles"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleAssignment;
