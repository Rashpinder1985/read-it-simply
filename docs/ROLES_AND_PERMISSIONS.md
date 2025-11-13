# Role-Based Access Control (RBAC) System

## Overview

MarketPulse uses a hierarchical role-based access control system where higher-level roles inherit all permissions from lower-level roles.

## Role Hierarchy

```
Admin (Highest)
  └─ Marketing Manager
      └─ Content Manager
          └─ Assets Manager (Base Level)
              └─ User (Lowest)
```

---

## Roles & Permissions

### 1. Assets Manager (Base Level)

**Purpose:** Manage media library and assets

**Permissions:**
- ✅ Upload pictures and videos
- ✅ Delete unwanted assets
- ✅ Rename and organize media files
- ✅ Manage storage capacity

**Responsibilities:**
- Keep media library organized
- Ensure proper naming conventions
- Monitor and manage storage usage
- Delete outdated or unused assets

**Access to:**
- Asset management interface
- Storage dashboard
- Media library

---

### 2. Content Manager

**Purpose:** Review and approve AI-generated content

**Inherits:** All Assets Manager permissions

**Additional Permissions:**
- ✅ Approve AI-generated content
- ✅ Reject content with feedback
- ✅ Edit captions via WYSIWYG editor
- ✅ Manage content attachments
- ✅ Provide rejection reasons

**Responsibilities:**
- Review all AI-generated content
- Approve quality content for scheduling
- Reject poor content with constructive feedback
- Edit and refine content captions
- Ensure brand voice consistency

**Access to:**
- All Assets Manager features
- Content Approval Center
- WYSIWYG content editor
- Rejection reason forms

**Workflow:**
1. Review AI-generated content
2. Approve → Content goes to scheduler
3. Reject → Content returns with feedback
4. Edit → Refine captions and attachments

---

### 3. Marketing Manager

**Purpose:** Execute marketing strategy and campaigns

**Inherits:** All Assets Manager + Content Manager permissions

**Additional Permissions:**
- ✅ Create market analysis
- ✅ Post content to social media
- ✅ Run marketing campaigns
- ✅ View detailed analytics
- ✅ Schedule content for publication

**Responsibilities:**
- Develop marketing strategies
- Analyze market trends and competitors
- Execute social media campaigns
- Monitor campaign performance
- Schedule content for optimal times

**Access to:**
- All Assets Manager features
- All Content Manager features
- Analytics dashboard
- Campaign management
- Content scheduler
- Market analysis tools

**Workflow:**
1. Analyze market data and trends
2. Create campaign strategies
3. Review and approve content
4. Schedule content publication
5. Post to social media platforms
6. Monitor campaign analytics

---

### 4. Admin (Highest Level)

**Purpose:** Full system administration

**Inherits:** All permissions from Assets Manager + Content Manager + Marketing Manager

**Additional Permissions:**
- ✅ Add, edit, delete users
- ✅ Assign and change user roles
- ✅ Edit company/brand details
- ✅ Configure system settings
- ✅ View all user data
- ✅ Access audit logs

**Responsibilities:**
- Manage team members
- Configure company settings
- Oversee all operations
- Ensure system security
- Handle user access control

**Access to:**
- **Everything** across the platform
- User Management interface
- Role Assignment dashboard
- Company Settings
- System Configuration
- Audit logs

**Workflow:**
1. Onboard new team members
2. Assign appropriate roles
3. Configure company details
4. Monitor system usage
5. Maintain security

---

### 5. User (Basic Level)

**Purpose:** View-only access

**Permissions:**
- ✅ View published content
- ✅ View basic analytics

**Responsibilities:**
- View content performance
- Monitor basic metrics

**Access to:**
- Published content view
- Basic analytics dashboard

---

## Implementation

### Using Permissions in Code

#### 1. Check User Role
```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { role, loading } = usePermissions();
  
  if (loading) return <Loader />;
  
  return <div>Your role: {role}</div>;
}
```

#### 2. Check Specific Permission
```typescript
import { usePermissions } from '@/hooks/usePermissions';

function AssetUploader() {
  const { can } = usePermissions();
  
  if (!can('upload_assets')) {
    return <div>You don't have permission to upload assets</div>;
  }
  
  return <UploadForm />;
}
```

#### 3. Check Feature Access
```typescript
import { usePermissions } from '@/hooks/usePermissions';

function Dashboard() {
  const { canAccessFeature } = usePermissions();
  
  return (
    <div>
      {canAccessFeature('asset-management') && <AssetManagement />}
      {canAccessFeature('content-approval') && <ContentApproval />}
      {canAccessFeature('analytics') && <Analytics />}
      {canAccessFeature('user-management') && <UserManagement />}
    </div>
  );
}
```

#### 4. Role Hierarchy Checks
```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { isAdmin, isMarketingManager, isContentManager, isAssetsManager } = usePermissions();
  
  if (isAdmin()) {
    // Show admin-only features
  } else if (isMarketingManager()) {
    // Show marketing features
  } else if (isContentManager()) {
    // Show content approval features
  } else if (isAssetsManager()) {
    // Show asset management features
  }
}
```

---

## Permission Keys

### Asset Management
- `upload_assets` - Upload media files
- `delete_assets` - Remove assets
- `rename_assets` - Organize and rename
- `view_storage` - Monitor storage

### Content Management
- `approve_content` - Approve content
- `reject_content` - Reject with reason
- `edit_content` - Edit via WYSIWYG
- `manage_attachments` - Handle attachments

### Marketing
- `create_analysis` - Generate insights
- `post_content` - Publish to social
- `view_analytics` - View metrics
- `run_campaigns` - Execute campaigns
- `schedule_content` - Schedule posts

### Administration
- `manage_users` - User CRUD operations
- `assign_roles` - Change user roles
- `edit_company` - Company settings
- `system_settings` - System config
- `view_all_data` - Access all data

---

## Feature Access Keys

Use these with `canAccessFeature()`:

- `asset-management` - Asset upload, delete, organize
- `content-approval` - Content review and approval
- `analytics` - Detailed analytics dashboard
- `campaigns` - Campaign management
- `user-management` - User administration
- `company-settings` - Company configuration

---

## Database Schema

### user_roles table
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'marketing', 'content', 'assets', 'user')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Best Practices

1. **Always check permissions** before rendering UI elements
2. **Use role hierarchy** - Higher roles inherit lower role permissions
3. **Fail securely** - Default to denying access if role is unclear
4. **Validate on backend** - Never trust frontend-only permission checks
5. **Audit changes** - Log all role changes and permission grants

---

## Examples

### Hide Features by Role
```typescript
{isContentManager() && <ApprovalButton />}
{isMarketingManager() && <AnalyticsDashboard />}
{isAdmin() && <UserManagement />}
```

### Disable Features by Permission
```typescript
<Button disabled={!can('post_content')}>
  Post to Social Media
</Button>
```

### Conditional Routing
```typescript
if (!isAdmin()) {
  navigate('/unauthorized');
}
```

---

## Testing Roles

1. **Create test users** with different roles via User Management
2. **Login as each role** to verify permissions
3. **Check feature access** - Ensure proper restrictions
4. **Test edge cases** - Users with no role, invalid roles
5. **Verify hierarchy** - Higher roles have all lower permissions

---

## Security Considerations

1. **RLS Policies** - Enforce permissions at database level
2. **Edge Functions** - Validate roles before processing
3. **Frontend Guards** - Prevent UI access to unauthorized features
4. **API Authorization** - Check permissions on all endpoints
5. **Audit Logging** - Track all permission-related actions

---

## Support

For questions about roles and permissions:
- Review this documentation
- Check `/src/lib/permissions.ts` for all permission definitions
- Use `/src/hooks/usePermissions.ts` for permission checks
- See User Management interface for role assignment



