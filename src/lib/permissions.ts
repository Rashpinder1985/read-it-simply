/**
 * Role-Based Access Control (RBAC) System
 * 
 * Role Hierarchy (from lowest to highest):
 * 1. Assets Manager
 * 2. Content Manager (inherits Assets Manager)
 * 3. Marketing Manager (inherits Content Manager + Assets Manager)
 * 4. Admin (inherits all)
 */

export type UserRole = 'admin' | 'marketing' | 'content' | 'assets' | 'user';

export interface Permission {
  key: string;
  label: string;
  description: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Assets Manager - Base level permissions
  assets: [
    {
      key: 'upload_assets',
      label: 'Upload Assets',
      description: 'Upload pictures and videos to the media library'
    },
    {
      key: 'delete_assets',
      label: 'Delete Assets',
      description: 'Remove unwanted assets and manage storage'
    },
    {
      key: 'rename_assets',
      label: 'Organize Assets',
      description: 'Rename and organize media files'
    },
    {
      key: 'view_storage',
      label: 'View Storage',
      description: 'Monitor storage usage and capacity'
    },
  ],

  // Content Manager - Assets Manager + Content approval
  content: [
    {
      key: 'upload_assets',
      label: 'Upload Assets',
      description: 'Upload pictures and videos to the media library'
    },
    {
      key: 'delete_assets',
      label: 'Delete Assets',
      description: 'Remove unwanted assets and manage storage'
    },
    {
      key: 'rename_assets',
      label: 'Organize Assets',
      description: 'Rename and organize media files'
    },
    {
      key: 'view_storage',
      label: 'View Storage',
      description: 'Monitor storage usage and capacity'
    },
    {
      key: 'approve_content',
      label: 'Approve Content',
      description: 'Approve or reject AI-generated content'
    },
    {
      key: 'edit_content',
      label: 'Edit Content',
      description: 'Edit captions and content via WYSIWYG editor'
    },
    {
      key: 'reject_content',
      label: 'Reject Content',
      description: 'Reject content with reason and feedback'
    },
    {
      key: 'manage_attachments',
      label: 'Manage Attachments',
      description: 'Upload and manage content attachments'
    },
  ],

  // Marketing Manager - Content Manager + Analytics + Campaigns
  marketing: [
    {
      key: 'upload_assets',
      label: 'Upload Assets',
      description: 'Upload pictures and videos to the media library'
    },
    {
      key: 'delete_assets',
      label: 'Delete Assets',
      description: 'Remove unwanted assets and manage storage'
    },
    {
      key: 'rename_assets',
      label: 'Organize Assets',
      description: 'Rename and organize media files'
    },
    {
      key: 'view_storage',
      label: 'View Storage',
      description: 'Monitor storage usage and capacity'
    },
    {
      key: 'approve_content',
      label: 'Approve Content',
      description: 'Approve or reject AI-generated content'
    },
    {
      key: 'edit_content',
      label: 'Edit Content',
      description: 'Edit captions and content via WYSIWYG editor'
    },
    {
      key: 'reject_content',
      label: 'Reject Content',
      description: 'Reject content with reason and feedback'
    },
    {
      key: 'manage_attachments',
      label: 'Manage Attachments',
      description: 'Upload and manage content attachments'
    },
    {
      key: 'create_analysis',
      label: 'Create Analysis',
      description: 'Generate market analysis and insights'
    },
    {
      key: 'post_content',
      label: 'Post Content',
      description: 'Publish approved content to social media'
    },
    {
      key: 'view_analytics',
      label: 'View Analytics',
      description: 'Access detailed analytics and reports'
    },
    {
      key: 'run_campaigns',
      label: 'Run Campaigns',
      description: 'Create and manage marketing campaigns'
    },
    {
      key: 'schedule_content',
      label: 'Schedule Content',
      description: 'Schedule content for future publication'
    },
  ],

  // Admin - Full access to everything
  admin: [
    {
      key: 'upload_assets',
      label: 'Upload Assets',
      description: 'Upload pictures and videos to the media library'
    },
    {
      key: 'delete_assets',
      label: 'Delete Assets',
      description: 'Remove unwanted assets and manage storage'
    },
    {
      key: 'rename_assets',
      label: 'Organize Assets',
      description: 'Rename and organize media files'
    },
    {
      key: 'view_storage',
      label: 'View Storage',
      description: 'Monitor storage usage and capacity'
    },
    {
      key: 'approve_content',
      label: 'Approve Content',
      description: 'Approve or reject AI-generated content'
    },
    {
      key: 'edit_content',
      label: 'Edit Content',
      description: 'Edit captions and content via WYSIWYG editor'
    },
    {
      key: 'reject_content',
      label: 'Reject Content',
      description: 'Reject content with reason and feedback'
    },
    {
      key: 'manage_attachments',
      label: 'Manage Attachments',
      description: 'Upload and manage content attachments'
    },
    {
      key: 'create_analysis',
      label: 'Create Analysis',
      description: 'Generate market analysis and insights'
    },
    {
      key: 'post_content',
      label: 'Post Content',
      description: 'Publish approved content to social media'
    },
    {
      key: 'view_analytics',
      label: 'View Analytics',
      description: 'Access detailed analytics and reports'
    },
    {
      key: 'run_campaigns',
      label: 'Run Campaigns',
      description: 'Create and manage marketing campaigns'
    },
    {
      key: 'schedule_content',
      label: 'Schedule Content',
      description: 'Schedule content for future publication'
    },
    {
      key: 'manage_users',
      label: 'Manage Users',
      description: 'Add, edit, and delete user accounts'
    },
    {
      key: 'assign_roles',
      label: 'Assign Roles',
      description: 'Change user roles and permissions'
    },
    {
      key: 'edit_company',
      label: 'Edit Company Details',
      description: 'Update company and brand information'
    },
    {
      key: 'view_all_data',
      label: 'View All Data',
      description: 'Access all data across the platform'
    },
    {
      key: 'system_settings',
      label: 'System Settings',
      description: 'Configure system-wide settings'
    },
  ],

  // User - Basic read-only access
  user: [
    {
      key: 'view_content',
      label: 'View Content',
      description: 'View published content'
    },
    {
      key: 'view_analytics_basic',
      label: 'View Basic Analytics',
      description: 'View basic performance metrics'
    },
  ],
};

export const ROLE_DETAILS: Record<UserRole, { label: string; description: string; color: string }> = {
  admin: {
    label: 'Admin',
    description: 'Full system access - Manage users, company details, and all features',
    color: 'bg-red-500'
  },
  marketing: {
    label: 'Marketing Manager',
    description: 'Create analysis, post content, run campaigns + all Content Manager & Assets Manager permissions',
    color: 'bg-blue-500'
  },
  content: {
    label: 'Content Manager',
    description: 'Approve/reject content, edit captions + all Assets Manager permissions',
    color: 'bg-purple-500'
  },
  assets: {
    label: 'Assets Manager',
    description: 'Upload, delete, and organize media assets (pictures & videos)',
    color: 'bg-green-500'
  },
  user: {
    label: 'User',
    description: 'Basic read-only access to content and analytics',
    color: 'bg-gray-500'
  },
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole, permissionKey: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.some(p => p.key === permissionKey);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user can access a feature
 */
export function canAccess(userRole: UserRole, feature: string): boolean {
  const featurePermissions: Record<string, string[]> = {
    'asset-management': ['upload_assets', 'delete_assets', 'rename_assets'],
    'content-approval': ['approve_content', 'edit_content', 'reject_content'],
    'analytics': ['view_analytics', 'create_analysis'],
    'campaigns': ['run_campaigns', 'post_content'],
    'user-management': ['manage_users', 'assign_roles'],
    'company-settings': ['edit_company'],
  };

  const requiredPermissions = featurePermissions[feature] || [];
  return requiredPermissions.some(perm => hasPermission(userRole, perm));
}

