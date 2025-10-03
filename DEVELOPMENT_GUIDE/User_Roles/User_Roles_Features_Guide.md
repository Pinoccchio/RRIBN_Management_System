# User Roles, Features & Permissions Guide
## Centralize Reservist Management System for 301st Community Defense Center

---

## **🔐 ACCOUNT CREATION & MANAGEMENT HIERARCHY**

> **VERIFIED CORRECT - Updated October 2025**

### **Critical Account Management Rules:**

| Action | Who Performs | Authority Level |
|--------|--------------|-----------------|
| **Create Administrator Account** | Super Administrator ONLY | Highest |
| **Create Staff Account** | Administrator | High |
| **Activate/Deactivate Administrator** | Super Administrator ONLY | Highest |
| **Activate/Deactivate Staff** | Super Administrator OR Administrator | High |
| **Approve Reservist Account** | Staff (initial) → Administrator (final) | Medium |
| **Oversee ALL Accounts (Web + Mobile)** | Super Administrator ONLY | Highest |

### **Account Creation Flow:**

```
SUPER ADMINISTRATOR
  ├─ Creates → Administrator Accounts
  ├─ Activates/Deactivates → Administrator Accounts
  ├─ Activates/Deactivates → Staff Accounts (can override)
  └─ Oversees → ALL Accounts (Web + Mobile)

ADMINISTRATOR
  ├─ Creates → Staff Accounts
  ├─ Activates/Deactivates → Staff Accounts
  ├─ Approves → Reservist Accounts (final approval)
  └─ Cannot Create/Manage → Other Administrators

STAFF
  ├─ Registers → Reservist Accounts
  ├─ Initial Verification → Reservist Documents
  └─ Cannot Create → Administrator or Staff Accounts
```

**Important Notes:**
- Super Administrator has **FULL CONTROL** over administrator accounts
- Only Super Administrator can **archive** both staff and administrator accounts
- Staff can only **recommend** activation of reservist accounts (Administrator approves)
- Super Administrator oversees **ALL accounts** on both Web and Mobile platforms

---

## **SUPER ADMINISTRATOR**

### **Access Level**
Highest system authority with complete oversight and control over all modules and users.

### **Core Features & Capabilities**

#### **1. User Authentication & Account Management**
- **Login** with secure credentials
- **Create Administrator accounts** (ONLY Super Admin can do this)
- **Create Staff accounts** (Super Admin can do this, but typically delegated to Administrators)
- **Approve and Activate Administrator accounts** (ONLY Super Admin)
- **Approve and Activate Staff accounts** (Super Admin OR Administrator)
- **Archive/Deactivate Administrator accounts** (ONLY Super Admin)
- **Archive/Deactivate Staff accounts** (Super Admin OR Administrator)
- **Manage user hierarchies** across the entire system
- **Oversee ALL accounts** (Web + Mobile platforms)

#### **2. Dashboard & Analytics**
- **View system-wide dashboards** with comprehensive metrics
- **Monitor overall system performance**
- **Access system statistics** (user activities, administrator actions, user statistics, security logs)
- **View training performance and readiness analytics**
- **Access PRESCRIPTIVE ANALYTICS** (exclusive feature)
  - Analyze historical and real-time data
  - Generate recommendations for promotion eligibility
  - Provide training assignment recommendations
  - Generate compliance alerts
  - Optimize reservist deployment and assignments

#### **3. Administrator Management** (Super Admin EXCLUSIVE)
- **View all administrator accounts** and their statuses
- **Create new administrator accounts** with role assignments (EXCLUSIVE to Super Admin)
- **Modify administrator details** and permissions (EXCLUSIVE to Super Admin)
- **Activate administrator accounts** after creation (EXCLUSIVE to Super Admin)
- **Deactivate administrator accounts** (EXCLUSIVE to Super Admin)
- **Archive administrator accounts** (EXCLUSIVE to Super Admin)
- **Monitor administrator activities** across all companies
- **Maintain audit logs** of all administrator changes
- **Override any administrator action** when necessary

#### **4. Staff Management**
- **View all staff accounts** across all companies (Alpha, Bravo, Charlie, HQ, Signal, FAB)
- **Add new staff members** with specific company assignments (can delegate to Administrators)
- **Monitor staff activities** (document validation, training management, record updates)
- **Adjust company assignments** for staff
- **Modify staff access levels** and permissions
- **Activate staff accounts** (after Administrator creates them)
- **Deactivate staff accounts** (Super Admin OR Administrator)
- **Archive staff accounts** (Super Admin has full control, can override Administrator)
- **Review detailed logs** of staff interactions with reservist records

#### **5. Reservist Management (Full Oversight)**
- **View comprehensive reservist records** across all companies
- **Monitor reservist status** (Ready, Standby, Retired)
- **Review and override reservist status changes**
- **Override document validations** when necessary
- **Modify company assignments**
- **Track reservist distribution** across companies
- **Access complete service history** of all reservist
- **View document submissions** and validation status
- **Monitor training attendance** and qualifications

#### **6. Training Management (System-Wide)**
- **View all scheduled trainings** across all companies
- **Create and modify training schedules**
- **Set capacity limits** for training sessions
- **Specify training requirements** and prerequisites
- **Monitor training participation** across companies
- **Track training completion rates**
- **View training history** for each reservist
- **Identify training gaps** and intervention needs
- **Send notifications** for upcoming training sessions

#### **7. System Reports & Analytics**
- **Generate comprehensive analytics** about the entire system
- **Access various report types:**
  - Reservist readiness reports
  - Company strength reports
  - Training completion statistics
  - Document processing status reports
  - System-wide performance metrics
- **Create customized reports** based on specific parameters
- **Export reports** for offline analysis
- **Monitor company-wise reservist distribution**
- **Analyze training participation rates**
- **Review document validation statistics**

#### **8. System Configuration & Settings**
- **Configure system parameters:**
  - Company structures
  - Reservist status definitions
  - Document requirements
  - Training prerequisites
- **Adjust system notifications**
- **Manage user access levels**
- **Configure security protocols**
- **Set validation rules** for document processing
- **Define training requirements** specific to different companies
- **All configuration changes are logged** with timestamps and user identification

---

## **ADMINISTRATOR**

### **Access Level**
Supervisory role with broad system-wide management capabilities across companies.

### **Core Features & Capabilities**

#### **1. User Authentication**
- **Login** with secure credentials
- **Password recovery** through super administrator approval

#### **2. Dashboard**
- **View administrator dashboard** with comprehensive metrics
- **Monitor company-specific metrics** and performance indicators
- **Access reservist status** under supervision
- **View training progress** of reservist
- **Monitor document processing statistics**
- **Apply filters** for detailed analytics

#### **3. Staff Management** (Administrator Primary Responsibility)
- **Create new staff accounts** (Administrator's PRIMARY responsibility)
- **View staff listings** across assigned companies
- **Filter staff by company**
- **Monitor staff activities** in detail
- **Add new staff members** with detailed information and company assignment
- **Update staff information** and contact details
- **Modify company assignments** for staff
- **Activate staff accounts** after creation
- **Deactivate staff accounts** within their jurisdiction
- **Request staff permanent deletion** (requires Super Administrator approval)
- **Cannot create or manage** Administrator accounts (only Super Admin can)

#### **4. Reservist Management**
- **View reservist per company**
- **View reservist by status** (Ready, Standby, Retired)
- **Access individual reservist profiles**
- **View reservist account lists**
- **Process and validate documents**
- **Update reservist status** based on:
  - Training completion
  - Document verification
  - Other relevant factors
- **Automatic notifications** sent to reservist upon status changes

#### **5. Training Management**
- **View available trainings**
- **Monitor individual reservist participation**
- **View training schedules**
- **Track attendance records**
- **Monitor completion rates**

#### **6. Company & Unit Management**
- **Manage list of companies** associated with the system
- **View company structures**
- **Oversee company-level operations**

#### **7. Reports & Analytics**
- **Generate company-level reports:**
  - Reservist status reports
  - Training completion rates
  - Document processing statistics
- **Specify report parameters** (date ranges, company filters, specific metrics)
- **View clear visualizations** and detailed tables
- **Export reports** for offline analysis or presentations

#### **8. Notification System**
- **View official announcements**
- **Stay informed** of disseminated communications

#### **9. Account Control**
- **Activate or deactivate reservist accounts**
- **Activate or deactivate staff accounts**
- **Administrative authority** over user access and operational status

---

## **STAFF**

### **Access Level**
Company-level operational role focused on day-to-day reservist management within assigned companies.

### **Core Features & Capabilities**

#### **1. User Authentication**
- **Login** with secure credentials
- **Password recovery** through administrator approval

#### **2. Dashboard**
- **View staff dashboard** with operational metrics
- **Monitor company-specific data**
- **Access quick-view statistics** for assigned responsibilities

#### **3. Company & Unit Management**
- **Manage specific companies** (Alpha, Bravo, Charlie, HQ, Signal, FAB)
- **View company structures**
- **Monitor company operations**

#### **4. Reservist Records Management**
- **View and manage reservist records** within assigned companies
- **Add new reservist** to the system
- **Update existing reservist records**
- **Modify reservist status** (Ready, Standby, Retired)
- **Track reservist documents**
- **Monitor training participation**
- **View status change history**
- **Maintain detailed logs** of all modifications

#### **5. Document Management**
- **Validate documents** submitted by reservist
- **Review document contents**
- **Verify compliance** with requirements
- **Approve or reject documents** with detailed notes
- **Process new submissions**
- **Verify updated documents**
- **Update document status**
- **Automatic notifications** to reservist regarding document status

#### **6. Training Management**
- **Create training sessions** for assigned companies
- **Specify training details** (schedule, capacity, requirements)
- **Update existing training sessions**
- **Track attendance**
- **Record completion status**
- **Send notifications** to eligible reservist
- **Maintain comprehensive records** of training participation
- **Monitor completion rates**

#### **7. Announcement & Communication**
- **Create announcements** for assigned companies
- **Set priority levels** for announcements
- **Target specific companies or groups**
- **Edit existing announcements**
- **Archive outdated announcements**
- **Distribute notifications** effectively

#### **8. Reports**
- **Generate company-specific reports:**
  - Reservist status reports
  - Training completion rates
  - Document processing statistics
- **Specify report parameters** (company selection, date ranges)
- **View clear visualizations** and tables
- **Export reports** for offline analysis

#### **9. Status & Account Control**
- **Update reservist status**
- **Approve staff accounts** (initial verification)
- **Process account registrations**

---

## **RESERVIST (End User - Mobile Application)**

### **Access Level**
Individual user with self-service capabilities for personal records and training management.

### **Core Features & Capabilities**

#### **1. User Authentication**
- **Register** new account (requires approval)
- **Login** with secure credentials
- **Password recovery** through email verification

#### **2. Profile Management**
- **View personal profile** and information
- **Update personal information:**
  - Contact details
  - Personal data
  - Service-related information
- **Upload profile photo**
- **All changes validated** by the system

#### **3. Document Management**
- **Upload required documents** via mobile device:
  - Take photos using device camera
  - Select files from device storage
- **Specify document type** and provide descriptions
- **Track document status** (Pending, Verified, Rejected)
- **View validation results**
- **Resubmit documents** if necessary
- **Receive notifications** on document status changes

#### **4. Training Management**
- **View assigned training sessions**
- **View available training programs**
- **Register for training** activities
- **Check training eligibility** (system validates prerequisites and capacity)
- **Receive confirmation** upon registration
- **View training history**
- **Access training completion status**
- **View digital certificates**
- **Automatic calendar updates** upon registration

#### **5. Calendar & Schedule**
- **View schedules** in monthly calendar or list format
- **View training dates** and company events
- **View personal commitments**
- **Select specific dates** for detailed event information
- **Set reminders** for upcoming events
- **Automatic synchronization** with training registrations and announcements

#### **6. Notification System**
- **Receive push notifications** for:
  - Important updates
  - Document status changes
  - Training schedules
  - Company announcements
  - Action-required items
- **View notification details**
- **Take required actions** directly from notifications
- **Set notification preferences**
- **Track read/unread status**
- **Guided steps** for completing required tasks

#### **7. Policy Access**
- **View promotion policies**
- **Access military guidelines**
- **Read current organizational policies**
- **Stay informed** of policy updates
- **Review compliance requirements**

#### **8. Training History**
- **View complete training history**
- **Review past participation**
- **Monitor qualifications progress**
- **Track completed trainings**
- **Access training records**

---

## **ROLE COMPARISON MATRIX**

| Feature | Super Admin | Administrator | Staff | Reservist |
|---------|-------------|--------------|-------|-----------|
| **Prescriptive Analytics** | ✓ | ✗ | ✗ | ✗ |
| **Create Admin/Staff Accounts** | ✓ | ✗ | ✗ | ✗ |
| **Approve Admin/Staff** | ✓ | ✗ | ✗ | ✗ |
| **System Configuration** | ✓ | ✗ | ✗ | ✗ |
| **System-Wide Reports** | ✓ | ✓ | ✗ | ✗ |
| **Override Status/Documents** | ✓ | ✓ | ✗ | ✗ |
| **Manage All Companies** | ✓ | ✓ | Assigned Only | ✗ |
| **Create Training Sessions** | ✓ | ✓ | ✓ | ✗ |
| **Validate Documents** | ✓ | ✓ | ✓ | ✗ |
| **Approve Accounts** | ✓ | ✓ | ✓ (Staff only) | ✗ |
| **Update Reservist Records** | ✓ | ✓ | ✓ | Self Only |
| **Upload Documents** | ✗ | ✗ | ✗ | ✓ |
| **Register for Training** | ✗ | ✗ | ✗ | ✓ |
| **Mobile Access** | ✗ | ✗ | ✗ | ✓ |
| **View Own Calendar** | ✗ | ✗ | ✗ | ✓ |

---

## **KEY SYSTEM CHARACTERISTICS**

### **Security Features**
- Role-based access control (RBAC)
- Session tracking
- Password encryption
- Multi-factor authentication for high-level users
- Audit logging for all user actions
- Encrypted data transmission
- Secure credential storage

### **Automation Features**
- Automatic eligibility checks for training
- Automated notifications and alerts
- Automatic calendar synchronization
- Automatic status updates upon document approval
- System-generated reports
- Prescriptive analytics recommendations (Super Admin only)

### **Data Management**
- Centralized database (Supabase PostgreSQL)
- Real-time data synchronization via Supabase subscriptions
- Document version control via `version` column in documents table
- Comprehensive audit trails via `audit_logs` table
- Data validation via database constraints and TypeScript types
- Row-Level Security (RLS) policies for data isolation
- Export capabilities for reports

### **Platform Distribution**
- **Web Application:** Super Administrator, Administrator, Staff
  - Built with Next.js 15 + TypeScript
  - Deployed on Vercel
- **Mobile Application:** Reservist (iOS and Android - planned)
  - React Native (future development)
- **Backend:**
  - Supabase (PostgreSQL database + Auth + Storage + Edge Functions)
  - Next.js API Routes for custom business logic
- **Database:** Supabase PostgreSQL with Row-Level Security

---

## **WORKFLOW HIERARCHIES**

### **Account Creation & Approval**
1. **Super Admin** creates Admin/Staff accounts
2. **Admin/Staff** require Super Admin approval before activation
3. **Reservist** self-register via mobile app
4. **Staff** performs initial verification of Reservist accounts
5. **Admin** provides final approval for Reservist accounts

### **Document Processing**
1. **Reservist** uploads documents via mobile app
2. **Staff** reviews and validates documents
3. **Admin** can override validations if needed
4. **Super Admin** has full override authority
5. **System** sends automatic notifications at each stage

### **Training Management**
1. **Super Admin/Admin** creates system-wide trainings
2. **Staff** creates company-specific trainings
3. **Reservist** views and registers for trainings via mobile
4. **Staff** tracks attendance and completion
5. **Admin** monitors training completion rates
6. **Super Admin** analyzes training effectiveness via prescriptive analytics

### **Status Updates**
1. **Staff** initiates status changes for reservist
2. **Admin** reviews and approves major status changes
3. **Super Admin** can override any status change
4. **System** automatically notifies affected reservist

---

## **DEVELOPMENT RECOMMENDATIONS**

### **For Implementation:**
1. **Row-Level Security (RLS)** - Implement RLS policies on all Supabase tables
   - Super Admin: `(auth.jwt() ->> 'role')::text = 'super_admin'`
   - Admin: `(auth.jwt() ->> 'role')::text IN ('super_admin', 'admin')`
   - Staff: Check `assigned_companies` array for company-level access
   - Reservist: `auth.uid() = id` (own data only)
2. Ensure all actions are logged via `audit_logs` table with triggers
3. Build approval workflows using `status` enums and `approved_by` columns
4. Create automated notification triggers via database triggers or Edge Functions
5. Design mobile interface with offline capability (future - React Native)
6. Implement real-time synchronization via Supabase Realtime subscriptions
7. Build prescriptive analytics using Supabase Edge Functions or Next.js API routes
8. Use Supabase Storage for document uploads with signed URLs and access policies
9. Create comprehensive admin panels using Next.js Server Components
10. Build flexible reporting with Supabase views and materialized views

### **For Security:**
1. Implement Supabase Auth with email/password (MFA available via Supabase)
2. Use HTTPS for all connections (enforced by Vercel and Supabase)
3. Create detailed audit trails via `audit_logs` table with automatic triggers
4. Implement session management via Supabase Auth (configurable timeout)
5. Build password recovery using Supabase Auth reset password flow
6. Secure API endpoints with middleware checks and Supabase RLS
7. Implement rate limiting via Supabase Edge Functions or Vercel middleware
8. Use Supabase Storage validation policies and file type restrictions

### **For User Experience:**
1. Design intuitive dashboards for each role
2. Implement responsive design for web application
3. Optimize mobile app for offline use scenarios
4. Create clear visual indicators for status and approvals
5. Build comprehensive notification system
6. Design easy-to-navigate menu structures
7. Implement search and filter capabilities
8. Create helpful tooltips and guidance

---

## **ROW-LEVEL SECURITY (RLS) POLICY EXAMPLES**

### **Purpose:**
RLS policies enforce data access control at the database level, ensuring users can only access data they're authorized to see based on their role and company assignment.

### **Policy Examples:**

#### **1. Super Admin - Full Access**
```sql
-- Super Admins can see all records
CREATE POLICY "super_admin_all_access" ON public.accounts
  FOR ALL
  USING ((auth.jwt() ->> 'role')::text = 'super_admin');
```

#### **2. Admin - Company-Level Access**
```sql
-- Admins can see accounts in their assigned companies
CREATE POLICY "admin_company_access" ON public.reservist_details
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role')::text IN ('super_admin', 'admin')
    OR company IN (
      SELECT unnest(assigned_companies)
      FROM staff_details
      WHERE id = auth.uid()
    )
  );
```

#### **3. Staff - Company-Specific Access**
```sql
-- Staff can only access reservists in their assigned companies
CREATE POLICY "staff_assigned_companies" ON public.reservist_details
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role')::text IN ('super_admin', 'admin')
    OR company IN (
      SELECT unnest(assigned_companies)
      FROM staff_details
      WHERE id = auth.uid()
    )
  );
```

#### **4. Reservist - Own Data Only**
```sql
-- Reservists can only access their own profile
CREATE POLICY "reservist_own_profile" ON public.profiles
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role')::text IN ('super_admin', 'admin', 'staff')
    OR auth.uid() = id
  );

-- Reservists can only update their own profile
CREATE POLICY "reservist_update_own_profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

#### **5. Document Access Control**
```sql
-- Documents: Users can see documents based on their role
CREATE POLICY "document_access" ON public.documents
  FOR SELECT
  USING (
    -- Super Admin sees all
    (auth.jwt() ->> 'role')::text = 'super_admin'
    -- Admin/Staff see documents in their companies
    OR (
      (auth.jwt() ->> 'role')::text IN ('admin', 'staff')
      AND reservist_id IN (
        SELECT id FROM reservist_details
        WHERE company IN (
          SELECT unnest(assigned_companies)
          FROM staff_details
          WHERE id = auth.uid()
        )
      )
    )
    -- Reservists see only their own documents
    OR reservist_id = auth.uid()
  );
```

### **Implementation Notes:**
1. All tables must have RLS enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Policies are evaluated in order - most permissive first
3. Use `USING` clause for SELECT/UPDATE/DELETE, `WITH CHECK` for INSERT/UPDATE
4. JWT claims are set via Supabase Auth metadata
5. Test policies thoroughly for each role before deployment

---

This guide provides a comprehensive overview of all user roles, their features, and capabilities for development of the Centralize Reservist Management System using **Next.js 15 + Supabase PostgreSQL architecture**.
