import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hasPermission, canAccess, getRolePermissions, type UserRole, type Permission } from '@/lib/permissions';

/**
 * Hook to manage user permissions based on their role
 * 
 * @example
 * const { role, can, canAccessFeature, permissions, loading } = usePermissions();
 * 
 * if (can('manage_users')) {
 *   // Show user management UI
 * }
 * 
 * if (canAccessFeature('asset-management')) {
 *   // Show asset management features
 * }
 */
export function usePermissions() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        setPermissions([]);
        return;
      }

      const { data, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) throw roleError;

      const userRole = (data?.role as UserRole) || 'user';
      setRole(userRole);
      setPermissions(getRolePermissions(userRole));
    } catch (err) {
      console.error('Error fetching user role:', err);
      setError(err as Error);
      setRole('user'); // Default to basic user role on error
      setPermissions(getRolePermissions('user'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has a specific permission
   * @param permissionKey - The permission key to check (e.g., 'upload_assets', 'manage_users')
   */
  const can = (permissionKey: string): boolean => {
    if (!role) return false;
    return hasPermission(role, permissionKey);
  };

  /**
   * Check if user can access a feature
   * @param feature - The feature to check (e.g., 'asset-management', 'user-management')
   */
  const canAccessFeature = (feature: string): boolean => {
    if (!role) return false;
    return canAccess(role, feature);
  };

  /**
   * Check if user is an admin
   */
  const isAdmin = (): boolean => role === 'admin';

  /**
   * Check if user is a marketing manager or higher
   */
  const isMarketingManager = (): boolean => ['admin', 'marketing'].includes(role || '');

  /**
   * Check if user is a content manager or higher
   */
  const isContentManager = (): boolean => ['admin', 'marketing', 'content'].includes(role || '');

  /**
   * Check if user is an assets manager or higher
   */
  const isAssetsManager = (): boolean => ['admin', 'marketing', 'content', 'assets'].includes(role || '');

  /**
   * Refresh user role and permissions
   */
  const refresh = () => {
    fetchUserRole();
  };

  return {
    role,
    permissions,
    loading,
    error,
    can,
    canAccessFeature,
    isAdmin,
    isMarketingManager,
    isContentManager,
    isAssetsManager,
    refresh,
  };
}

