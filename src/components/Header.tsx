import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { roles } = useUserRole(user?.id);
  const { toast } = useToast();
  
  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "Admin",
      marketing: "Marketing Manager",
      content: "Content Editor",
      assets: "Asset Manager",
    };
    return roleMap[role] || role;
  };
  
  const getRoleVariant = (role: string): "default" | "secondary" | "outline" => {
    if (role === "admin") return "default";
    if (role === "marketing") return "secondary";
    return "outline";
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center font-bold text-primary shadow-[var(--shadow-gold)]">
              F
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">FiftIn Labs</h1>
              <p className="text-xs text-muted-foreground">AI Marketing Automation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.email || 'Account'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {roles.length > 0 && (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-xs text-muted-foreground mb-1">Your Role{roles.length > 1 ? 's' : ''}</p>
                      <div className="flex flex-wrap gap-1">
                        {roles.map((role) => (
                          <Badge key={role} variant={getRoleVariant(role)} className="text-xs">
                            {getRoleDisplay(role)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
