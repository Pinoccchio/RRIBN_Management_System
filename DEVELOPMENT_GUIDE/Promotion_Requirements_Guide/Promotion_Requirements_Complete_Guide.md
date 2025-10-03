# Promotion System Requirements & Rules
## Complete Development Guide for NCO and Commissioned Officers

---

## 🎯 **CRITICAL UPDATE: TWO PERSONNEL TYPES**

The system must support **TWO DISTINCT PERSONNEL CLASSIFICATIONS** with different promotion rules:

### **1. NON-COMMISSIONED OFFICERS (NCO)**
**Ranks:** Private → Private First Class → Corporal → Sergeant

**Priority:** ⭐ **START WITH NCO FIRST** (per client interview)

### **2. COMMISSIONED OFFICERS (CO)**
**Ranks:** Second Lieutenant → First Lieutenant → Captain → Major → Lieutenant Colonel → Colonel

**Note:** More complex promotion rules apply

---

## 📋 **DATABASE SCHEMA UPDATE**

### **Add Commission Type Field**

```javascript
ReservistProfile = {
  // ... existing fields ...
  
  // NEW FIELD: Commission Type
  commission_type: {
    type: String, // "NCO" or "CO"
    required: true,
    enum: ["NCO", "CO"],
    default: "NCO"
  },
  
  // Automatically determined based on rank
  is_commissioned: Boolean, // true if rank >= Second Lieutenant
  
  // ... rest of fields ...
};
```

### **Rank Classification Logic**

```javascript
const RANK_CLASSIFICATION = {
  // NON-COMMISSIONED OFFICERS (NCO)
  "NCO": [
    "Private (PVT)",
    "Private First Class (PFC)",
    "Corporal (CPL)",
    "Sergeant (SGT)"
  ],
  
  // COMMISSIONED OFFICERS (CO)
  "CO": [
    "Second Lieutenant (2LT)",
    "First Lieutenant (1LT)",
    "Captain (CPT)",
    "Major (MAJ)",
    "Lieutenant Colonel (LTCOL)",
    "Colonel (COL)"
  ]
};

// Auto-determine commission type from rank
function determineCommissionType(rank) {
  if (RANK_CLASSIFICATION.NCO.includes(rank)) {
    return "NCO";
  } else if (RANK_CLASSIFICATION.CO.includes(rank)) {
    return "CO";
  }
  return null;
}
```

---

## 🎖️ **NON-COMMISSIONED OFFICER (NCO) PROMOTION REQUIREMENTS**

### **Priority Focus Area**

According to the client interview: **"Unang i-focus ang Non-Commissioned"**
- Build and refine NCO promotion logic FIRST
- Test thoroughly before moving to Commissioned Officers

---

## 📊 **NCO PROMOTION REQUIREMENTS TABLE**

Based on the provided image data:

### **Rank: Private (PVT) → Private First Class (PFC)**

| Criterion | Requirement | Details |
|-----------|-------------|---------|
| **Trainings Required** | BMT Training, Documentary Requirements / Family Documents | Basic Military Training must be completed |
| **Active Duty Training** | Completed | Must have completed active duty training |
| **Reporting (Camp Duty)** | - | Not required for PVT |
| **Reservist Active Before Promotion** | - | No prior service required |
| **Activities/Seminars** | 0 | No seminars required |

**Summary:** Initial entry rank, minimal requirements.

---

### **Rank: Private First Class (PFC) → Corporal (CPL)**

| Criterion | Requirement | Details |
|-----------|-------------|---------|
| **Trainings Required** | 1 training (e.g., Rifle Marksmanship) | At least 1 specialized training course |
| **Active Duty Training** | Completed | Must have completed active duty training |
| **Reporting (Camp Duty)** | 30 days (Jan-Dec 2023) | Must complete 30 days of camp duty reporting |
| **Reservist Active Before Promotion** | 3 years (2021-2024) | Must be active reservist for 3 years |
| **Activities/Seminars** | 3 seminars | Must complete 3 seminars:<br>- Leadership 101<br>- Disaster Response<br>- Community Service |

**Key Requirements:**
- ✅ 1 training course completed
- ✅ 30 days camp duty
- ✅ 3 years active service
- ✅ 3 seminars

---

### **Rank: Corporal (CPL) → Sergeant (SGT)**

| Criterion | Requirement | Details |
|-----------|-------------|---------|
| **Trainings Required** | 2 trainings (e.g., Rifle Marksmanship, Combat Lifesaver Course) | At least 2 specialized training courses |
| **Active Duty Training** | Completed | Must have completed active duty training |
| **Reporting (Camp Duty)** | 30 days (Jan-Dec 2023) | Must complete 30 days of camp duty reporting |
| **Reservist Active Before Promotion** | 2 years (2022-2024) | Must be active reservist for 2 years |
| **Activities/Seminars** | 4 seminars | Must complete 4 seminars:<br>- Leadership<br>- First Aid<br>- Reserve Law<br>- Community Outreach |

**Key Requirements:**
- ✅ 2 training courses completed
- ✅ 30 days camp duty
- ✅ 2 years active service (from CPL rank date)
- ✅ 4 seminars

---

### **Rank: Sergeant (SGT) → Staff Sergeant or Higher**

| Criterion | Requirement | Details |
|-----------|-------------|---------|
| **Trainings Required** | 3 trainings (e.g., Rifle Marksmanship, Combat Lifesaver, Infantry Tactics) | At least 3 specialized training courses |
| **Active Duty Training** | Completed | Must have completed active duty training |
| **Reporting (Camp Duty)** | 30 days (Jan-Dec 2023) | Must complete 30 days of camp duty reporting |
| **Reservist Active Before Promotion** | 1 year (2024-2025) | Must be active reservist for 1 year |
| **Activities/Seminars** | 5 seminars | Must complete 5 seminars:<br>- Leadership<br>- Disaster Management<br>- Human Rights<br>- Reserve Integration<br>- Community Service |

**Key Requirements:**
- ✅ 3 training courses completed
- ✅ 30 days camp duty
- ✅ 1 year active service (from SGT rank date)
- ✅ 5 seminars

---

## 🎓 **COMMISSIONED OFFICER (CO) PROMOTION REQUIREMENTS**

### **Important Notes from Client Interview:**

> **"Regular promotion Enlisted personnel: one step at a time for promotion - sgt."**  
> **"Commissionship: Skip promotion (kapag naaapprove) - 1t - major - UPDATED"**

This means:
- **NCO:** Must go through each rank step-by-step (Private → PFC → CPL → SGT)
- **CO:** Can potentially skip ranks if certain requirements are met (e.g., 1LT → Major)

---

## 📚 **EDUCATIONAL REQUIREMENTS FOR COMMISSIONED OFFICERS**

### **Critical Requirement from Interview:**

> **"Kapag gumgraduate ng Masteral Doctorotal or Academic pwedeng mag apply for Commissionship"**

**Translation:** If someone graduates with a Master's or Doctoral degree, they can apply for a commission.

### **Education-Based Promotion Rules:**

| Current Rank | Next Rank | Educational Requirement |
|--------------|-----------|------------------------|
| 2LT → 1LT | First Lieutenant | Bachelor's Degree (minimum) |
| 1LT → CPT | **Captain** | **Master's Degree REQUIRED** |
| CPT → MAJ | **Major** | **Doctoral Degree (Ph.D.) REQUIRED** |
| MAJ → LTCOL | **Lieutenant Colonel** | **Doctoral Degree (Ph.D.) REQUIRED** |
| LTCOL → COL | Colonel | Doctoral Degree + extensive experience |

**Database Implementation:**

```javascript
educational_requirements_CO: {
  "Second Lieutenant": {
    next_rank: "First Lieutenant",
    required_education: "Bachelor's Degree",
    education_level: "College"
  },
  "First Lieutenant": {
    next_rank: "Captain",
    required_education: "Master's Degree",
    education_level: "Graduate - Masters"
  },
  "Captain": {
    next_rank: "Major",
    required_education: "Doctoral Degree (Ph.D.)",
    education_level: "Graduate - Doctorate"
  },
  "Major": {
    next_rank: "Lieutenant Colonel",
    required_education: "Doctoral Degree (Ph.D.)",
    education_level: "Graduate - Doctorate"
  },
  "Lieutenant Colonel": {
    next_rank: "Colonel",
    required_education: "Doctoral Degree (Ph.D.) + Experience",
    education_level: "Graduate - Doctorate"
  }
};
```

---

## ⭐ **CRITICAL: TRAINING HOURS - THE MOST IMPORTANT METRIC** ⭐

### **🔴 MANDATORY SYSTEM REQUIREMENT - Updated October 2025 🔴**

> **"Hindi Bilang ng Training ang Basehan"**
> (Not the number of trainings that matters)

> **"Training Hours ang Tinitingnan"**
> (Training HOURS is what's evaluated)

> **"Ang pinaka-mahalagang metric ay ang kabuuang bilang ng training hours"**
> (The most important metric is the TOTAL NUMBER OF TRAINING HOURS)

### **Why This Matters:**

The system MUST track **TOTAL ACCUMULATED TRAINING HOURS**, not just the count of training sessions attended.

**❌ WRONG Approach:**
- Reservist attended 3 trainings → Eligible ✓

**✅ CORRECT Approach:**
- Reservist accumulated 120 training hours → Check if meets requirement (e.g., 150 hours) → Not Eligible (need 30 more hours)

### **Implementation Requirements:**

1. **Every training session MUST have hours recorded**
   - Field: `training_hours` (INTEGER, REQUIRED)
   - Examples: 8 hours, 40 hours, 120 hours

2. **System MUST calculate total accumulated hours**
   - Sum all completed training hours per reservist
   - Display prominently in promotion eligibility checks

3. **Promotion algorithm MUST prioritize hours over count**
   - Primary metric: Total training hours
   - Secondary metric: Number of trainings (for diversity)

4. **UI/UX MUST show hours, not just count**
   ```
   ✅ Training Progress: 120 / 150 hours (80%)
   ❌ Trainings Completed: 3 / 3 ✓
   ```

---

### **Database Schema Update for Training Hours (Supabase PostgreSQL)**

> **Updated for Next.js 15 + Supabase Architecture - October 2025**

#### **Training Sessions Table (with Hours Tracking)**

```sql
-- Extend existing training_sessions table
ALTER TABLE public.training_sessions
ADD COLUMN IF NOT EXISTS training_hours INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS hours_per_day NUMERIC,
ADD COLUMN IF NOT EXISTS total_training_days INTEGER,
ADD CONSTRAINT training_hours_positive CHECK (training_hours > 0);

-- Comment for clarity
COMMENT ON COLUMN public.training_sessions.training_hours IS
'CRITICAL: Total training hours (e.g., 8, 40, 120) - PRIMARY METRIC for promotion eligibility';
```

#### **Training Registrations Table (Track Hours Completed)**

```sql
-- Extend training_registrations to track hours completed
ALTER TABLE public.training_registrations
ADD COLUMN IF NOT EXISTS hours_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMPTZ,
ADD CONSTRAINT hours_completed_check CHECK (hours_completed >= 0);

-- Create view for total training hours per reservist
CREATE OR REPLACE VIEW reservist_training_hours AS
SELECT
  r.reservist_id,
  SUM(r.hours_completed) AS total_training_hours,
  COUNT(r.id) AS total_trainings_completed,
  -- Hours breakdown by category (if training_sessions has category field)
  SUM(CASE WHEN ts.training_category = 'Leadership' THEN r.hours_completed ELSE 0 END) AS leadership_hours,
  SUM(CASE WHEN ts.training_category = 'Combat' THEN r.hours_completed ELSE 0 END) AS combat_hours,
  SUM(CASE WHEN ts.training_category = 'Technical' THEN r.hours_completed ELSE 0 END) AS technical_hours,
  SUM(CASE WHEN ts.training_category = 'Seminar' THEN r.hours_completed ELSE 0 END) AS seminar_hours
FROM public.training_registrations r
JOIN public.training_sessions ts ON r.training_session_id = ts.id
WHERE r.completion_status = 'passed'
GROUP BY r.reservist_id;

-- Grant access to view
GRANT SELECT ON reservist_training_hours TO authenticated;
```

#### **Reservist Training Hours Tracking (Materialized View for Performance)**

```sql
-- Create materialized view for fast access
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_reservist_training_summary AS
SELECT
  rd.id AS reservist_id,
  rd.rank,
  rd.company,
  COALESCE(rth.total_training_hours, 0) AS total_training_hours,
  COALESCE(rth.total_trainings_completed, 0) AS total_trainings_completed,
  COALESCE(rth.leadership_hours, 0) AS leadership_hours,
  COALESCE(rth.combat_hours, 0) AS combat_hours,
  COALESCE(rth.technical_hours, 0) AS technical_hours,
  COALESCE(rth.seminar_hours, 0) AS seminar_hours,
  now() AS last_updated
FROM public.reservist_details rd
LEFT JOIN reservist_training_hours rth ON rd.id = rth.reservist_id;

-- Create index for fast lookups
CREATE INDEX idx_mv_training_reservist ON mv_reservist_training_summary(reservist_id);
CREATE INDEX idx_mv_training_hours ON mv_reservist_training_summary(total_training_hours DESC);

-- Refresh function (call after training completion updates)
CREATE OR REPLACE FUNCTION refresh_training_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reservist_training_summary;
END;
$$ LANGUAGE plpgsql;
```

#### **TypeScript Types for Training Hours**

```typescript
// src/lib/types/training.ts
export interface TrainingWithHours {
  id: string;
  title: string;
  training_hours: number; // PRIMARY METRIC
  hours_per_day?: number;
  total_training_days?: number;
  training_category?: 'Leadership' | 'Combat' | 'Technical' | 'Seminar' | 'Specialized';
  scheduled_date: string;
  end_date: string;
}

export interface ReservistTrainingHours {
  reservist_id: string;
  total_training_hours: number; // CRITICAL for promotion
  total_trainings_completed: number;
  leadership_hours: number;
  combat_hours: number;
  technical_hours: number;
  seminar_hours: number;
  last_updated: string;
}

export interface TrainingCompletionWithHours {
  training_id: string;
  training_name: string;
  hours_completed: number; // MUST match training_hours
  completion_date: string;
  certificate_number?: string;
}
```

---

## 🔄 **DYNAMIC TRAINING REQUIREMENTS**

### **Critical Information from Interview:**

> **"Dynamic ang Requirements"**  
> **"Ang required na training at bilang ng oras ay nagbabago halos kada taon"**  
> (Required training and number of hours changes almost every year)

> **"Ito ay dinedesisyunan ng General Headquarters"**  
> (This is decided by General Headquarters)

> **"Ang system ay dapat flexible para ma-update ang mga requirement na ito"**  
> (The system must be flexible to update these requirements)

---

### **Solution: Configurable Training Requirements (Supabase PostgreSQL)**

> **Super Admin Feature: Update requirements annually via Web Dashboard**

#### **Training Requirements Configuration Table**

```sql
-- Create promotion requirements configuration table
CREATE TABLE IF NOT EXISTS public.promotion_requirements_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id TEXT UNIQUE NOT NULL,
  effective_date DATE NOT NULL,
  year INTEGER NOT NULL,
  updated_by UUID REFERENCES public.accounts(id),

  -- Rank-specific requirements stored as JSONB for flexibility
  rank TEXT NOT NULL,
  personnel_type TEXT CHECK (personnel_type IN ('NCO', 'CO')),

  -- Training Requirements
  minimum_training_hours INTEGER NOT NULL,
  required_trainings TEXT[], -- Array of training names
  minimum_seminars INTEGER DEFAULT 0,
  seminar_hours INTEGER DEFAULT 0,

  -- NCO specific
  camp_duty_days INTEGER,
  years_active NUMERIC,

  -- CO specific (from EO 212)
  minimum_years_in_grade INTEGER,
  required_education TEXT, -- 'Bachelor', 'Master', 'Doctorate'
  active_duty_days INTEGER DEFAULT 21,
  efficiency_rating_required TEXT DEFAULT 'Satisfactory',

  -- Version control
  version INTEGER DEFAULT 1,
  previous_config_id UUID REFERENCES public.promotion_requirements_config(id),
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_active_rank_year UNIQUE (rank, year, is_active) WHERE is_active = true
);

-- Create index for fast lookups
CREATE INDEX idx_promo_req_rank ON promotion_requirements_config(rank);
CREATE INDEX idx_promo_req_year ON promotion_requirements_config(year DESC);
CREATE INDEX idx_promo_req_active ON promotion_requirements_config(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.promotion_requirements_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "promo_req_select" ON public.promotion_requirements_config
  FOR SELECT USING (
    is_active = true OR (auth.jwt() ->> 'role')::text IN ('super_admin', 'admin')
  );

CREATE POLICY "promo_req_insert" ON public.promotion_requirements_config
  FOR INSERT WITH CHECK ((auth.jwt() ->> 'role')::text = 'super_admin');

CREATE POLICY "promo_req_update" ON public.promotion_requirements_config
  FOR UPDATE USING ((auth.jwt() ->> 'role')::text = 'super_admin');
```

#### **Seed Data: Default Requirements for 2025**

```sql
-- Insert default NCO requirements
INSERT INTO public.promotion_requirements_config
  (config_id, rank, personnel_type, year, effective_date, minimum_training_hours, required_trainings, minimum_seminars, camp_duty_days, years_active)
VALUES
  ('NCO-PFC-2025', 'Private First Class', 'NCO', 2025, '2025-01-01', 40, ARRAY['BMT Training', 'Basic Orientation'], 3, 30, 3),
  ('NCO-CPL-2025', 'Corporal', 'NCO', 2025, '2025-01-01', 80, ARRAY['Rifle Marksmanship', 'Combat Lifesaver'], 4, 30, 2),
  ('NCO-SGT-2025', 'Sergeant', 'NCO', 2025, '2025-01-01', 120, ARRAY['Rifle Marksmanship', 'Combat Lifesaver', 'Infantry Tactics'], 5, 30, 1);

-- Insert default CO requirements
INSERT INTO public.promotion_requirements_config
  (config_id, rank, personnel_type, year, effective_date, minimum_training_hours, minimum_years_in_grade, required_education, active_duty_days)
VALUES
  ('CO-2LT-2025', 'Second Lieutenant', 'CO', 2025, '2025-01-01', 160, 2, 'Bachelor''s Degree', 21),
  ('CO-1LT-2025', 'First Lieutenant', 'CO', 2025, '2025-01-01', 200, 4, 'Master''s Degree', 21),
  ('CO-CPT-2025', 'Captain', 'CO', 2025, '2025-01-01', 240, 5, 'Doctoral Degree', 21);
```

#### **TypeScript Interface**

```typescript
// src/lib/types/promotion.ts
export interface PromotionRequirementsConfig {
  id: string;
  config_id: string;
  rank: string;
  personnel_type: 'NCO' | 'CO';
  year: number;
  effective_date: string;

  // Training requirements
  minimum_training_hours: number; // PRIMARY METRIC
  required_trainings: string[];
  minimum_seminars: number;
  seminar_hours?: number;

  // NCO specific
  camp_duty_days?: number;
  years_active?: number;

  // CO specific (EO 212)
  minimum_years_in_grade?: number;
  required_education?: string;
  active_duty_days?: number;
  efficiency_rating_required?: string;

  // Metadata
  version: number;
  is_active: boolean;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}
```

---

### **Super Admin Feature: Update Training Requirements**

#### **Next.js 15 API Route Implementation**

```typescript
// src/app/api/admin/promotion-requirements/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check if user is Super Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: account } = await supabase
    .from('accounts')
    .select('role')
    .eq('id', user.id)
    .single();

  if (account?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
  }

  // Parse request body
  const body = await request.json();
  const {
    year,
    rank,
    personnel_type,
    minimum_training_hours,
    required_trainings,
    minimum_seminars,
    camp_duty_days,
    years_active,
    // CO specific
    minimum_years_in_grade,
    required_education,
  } = body;

  // Deactivate previous config for this rank/year
  await supabase
    .from('promotion_requirements_config')
    .update({ is_active: false })
    .eq('rank', rank)
    .eq('year', year);

  // Insert new config
  const { data, error } = await supabase
    .from('promotion_requirements_config')
    .insert({
      config_id: `${personnel_type}-${rank.replace(/\s+/g, '-')}-${year}`,
      rank,
      personnel_type,
      year,
      effective_date: `${year}-01-01`,
      minimum_training_hours,
      required_trainings,
      minimum_seminars,
      camp_duty_days,
      years_active,
      minimum_years_in_grade,
      required_education,
      updated_by: user.id,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: `Requirements updated for ${rank} (${year})`,
    data,
  });
}

// Example Request Body
/*
POST /api/admin/promotion-requirements
{
  "year": 2025,
  "rank": "Corporal",
  "personnel_type": "NCO",
  "minimum_training_hours": 100,  // Updated from 80
  "required_trainings": ["Rifle Marksmanship", "Combat Lifesaver", "First Aid"],
  "minimum_seminars": 5,  // Updated from 4
  "camp_duty_days": 30,
  "years_active": 2
}
*/
```

---

## 📅 **PROMOTION TIMELINE FOR COMMISSIONED OFFICERS**

### **From Interview:**

> **"Posibleng ma-promote kada taon"**  
> (Possible to be promoted every year)

> **"e.g., First Lieutenant to Captain"**

> **"pero depende kung lahat ng requirements (edukasyon, training hours) ay kumpleto"**  
> (but depends if all requirements - education, training hours - are complete)

**Key Points:**
- Annual promotion cycles
- Must meet ALL requirements before promotion
- Faster promotion possible if requirements met early

---

## 💰 **EXTERNAL FACTORS (NON-AUTOMATIC PROMOTION)**

### **Important Clarification from Interview:**

> **"Ang promotion ay hindi automatic kahit kumpleto na ang requirements"**  
> (Promotion is NOT automatic even if all requirements are complete)

> **"Nakadepende pa rin ito sa budget at kung may bakanteng posisyon"**  
> (Still depends on budget and if there's a vacant position)

> **"e.g., may nag-retire"**  
> (e.g., someone retired)

> **"Ang system ay para i-track ang eligibility, hindi para awtomatikong mag-promote"**  
> (The system is for tracking eligibility, not for automatic promotion)

---

### **System Implementation:**

```javascript
PromotionEligibility = {
  reservist_id: String,
  current_rank: String,
  target_rank: String,
  
  // Eligibility Status
  is_eligible: Boolean, // true if all requirements met
  eligibility_score: Number, // 0-100
  
  // Requirements Status
  requirements_met: {
    education: Boolean,
    training_hours: Boolean,
    active_duty: Boolean,
    time_in_grade: Boolean,
    seminars: Boolean,
    camp_duty: Boolean
  },
  
  // External Factors (NOT automatically checked by system)
  external_factors: {
    budget_available: Boolean, // Set by Admin
    vacancy_available: Boolean, // Set by Admin
    retirement_occurred: Boolean, // Triggers vacancy
    position_id: String
  },
  
  // Final Status
  recommendation_status: String, // "Eligible", "Eligible - Pending Budget", "Not Eligible"
  
  notes: String // e.g., "Waiting for budget approval", "No vacant position"
};
```

**System Behavior:**
1. ✅ System automatically checks if reservist meets ALL requirements
2. ✅ System marks as "ELIGIBLE" when 100% complete
3. ⚠️ System shows "Eligible - Pending External Approval"
4. 👤 Human decision required for final promotion approval
5. 💰 Admin/Super Admin sets budget and vacancy status

---

## 🏗️ **ACCOUNT CREATION & ACTIVATION HIERARCHY**

### **From Image Text:**

> **"Creating accounts of Staff - The administrator should be the one who will be creating staff accounts."**

> **"Creating accounts of administrator - The super administrator should be the one who will be creating accounts of administrator."**

> **"Super Administrator Activation - The super administrator should be the one who will be activating/deactivating of the 'administrator' and achieve both the staff and administrator accounts and should also oversee all of the accounts both web and mobile."**

---

### **Account Management Rules:**

| Action | Who Can Perform | Who They Can Manage |
|--------|----------------|---------------------|
| **Create Staff Account** | Administrator | Staff only |
| **Create Administrator Account** | Super Administrator | Administrators only |
| **Activate/Deactivate Staff** | Administrator OR Super Administrator | Staff accounts |
| **Activate/Deactivate Administrator** | Super Administrator ONLY | Administrator accounts |
| **Approve Reservist Account** | Staff (initial) → Administrator (final) | Reservist accounts |
| **Oversee All Accounts** | Super Administrator ONLY | All accounts (Web + Mobile) |

---

### **Database Implementation:**

```javascript
AccountManagementRules = {
  // Super Admin capabilities
  super_admin_permissions: {
    can_create: ["Administrator", "Staff", "Reservist"],
    can_activate: ["Administrator", "Staff", "Reservist"],
    can_deactivate: ["Administrator", "Staff", "Reservist"],
    can_delete: ["Administrator", "Staff", "Reservist"],
    can_oversee: "ALL_ACCOUNTS", // Web + Mobile
    can_modify_permissions: true,
    can_reset_passwords: true
  },
  
  // Administrator capabilities
  administrator_permissions: {
    can_create: ["Staff", "Reservist"],
    can_activate: ["Staff", "Reservist"],
    can_deactivate: ["Staff", "Reservist"],
    can_delete: ["Staff"], // With approval
    can_oversee: ["Staff", "Reservist"], // Within assigned companies
    can_modify_permissions: false, // Cannot modify admin permissions
    cannot_manage: ["Administrator"] // Cannot create/manage other admins
  },
  
  // Staff capabilities
  staff_permissions: {
    can_create: ["Reservist"], // Can register new reservists
    can_activate: [], // Cannot directly activate
    can_approve_for_activation: ["Reservist"], // Can recommend for activation
    can_deactivate: [],
    can_delete: [],
    can_oversee: ["Reservist"], // Only within their company
    must_request_approval_from: "Administrator"
  }
};
```

---

### **Account Creation Workflow:**

```
SUPER ADMINISTRATOR
  │
  ├─ Creates Administrator Account
  │    ├─ Sets permissions
  │    ├─ Assigns companies
  │    └─ Activates account
  │
  ├─ Activates/Deactivates Administrator
  │    └─ Full control over all admin accounts
  │
  └─ Oversees ALL accounts (Web + Mobile)
       └─ Can view, modify, or delete any account

ADMINISTRATOR
  │
  ├─ Creates Staff Account
  │    ├─ Sets company assignment
  │    ├─ Sets permissions
  │    └─ Activates account
  │
  ├─ Activates/Deactivates Staff
  │    └─ Can manage staff within their jurisdiction
  │
  ├─ Approves Reservist Accounts (Final Approval)
  │    └─ Reviews staff recommendations
  │
  └─ Cannot create or manage other Administrators

STAFF
  │
  ├─ Creates Reservist Account (Registration)
  │    ├─ Enters all RIDS information
  │    ├─ Validates documents
  │    └─ Submits for Administrator approval
  │
  ├─ Recommends Activation
  │    └─ Cannot directly activate accounts
  │
  └─ Cannot create Staff or Administrator accounts

RESERVIST
  │
  └─ Self-Registration (Mobile App)
       ├─ Submits personal information
       ├─ Uploads documents
       └─ Waits for Staff verification → Admin approval
```

---

## 🖥️ **MOBILE APP REQUIREMENTS**

### **From Image Text:**

> **"RIDS sila mismo mag fillup part by part then pag priinit yung mismong RIDS ang template"**

**Translation:** 
- Reservists will fill up RIDS themselves part by part through the mobile app
- When printing, the official RIDS template will be used

---

### **Mobile RIDS Feature:**

```javascript
MobileRIDSFeatures = {
  // Step-by-step form
  step_by_step_completion: {
    step1: "Personnel Information",
    step2: "Personal Information", 
    step3: "Promotion History",
    step4: "Military Training",
    step5: "Awards and Decorations",
    step6: "Dependents",
    step7: "Educational Attainment",
    step8: "Active Duty Training",
    step9: "Unit Assignments",
    step10: "Designations",
    step11: "Biometrics (Photo, Thumbmark, Signature)",
    step12: "Review and Submit"
  },
  
  // Progressive save
  auto_save_draft: true,
  save_per_section: true,
  
  // Offline capability
  offline_mode: true,
  sync_when_online: true,
  
  // Camera integration
  camera_features: {
    take_photo: true, // 2x2 photo
    capture_thumbmark: true, // Right thumb
    capture_signature: true
  },
  
  // Print functionality
  generate_official_template: {
    format: "PDF",
    uses_official_rids_template: true,
    includes_all_sections: true,
    ready_for_submission: true
  }
};
```

---

## 🔢 **PROMOTION ALGORITHM - COMPLETE LOGIC**

### **NCO Promotion Scoring System**

```javascript
function calculateNCOPromotionEligibility(reservist) {
  const currentRank = reservist.current_rank;
  const requirements = NCO_REQUIREMENTS[currentRank];
  
  let score = 0;
  let maxScore = 100;
  let criteriaResults = {};
  
  // 1. Training Hours (30 points)
  const trainingHoursMet = reservist.total_training_hours >= requirements.minimum_training_hours;
  if (trainingHoursMet) {
    score += 30;
    criteriaResults.training_hours = { met: true, score: 30 };
  } else {
    criteriaResults.training_hours = { 
      met: false, 
      score: 0,
      current: reservist.total_training_hours,
      required: requirements.minimum_training_hours,
      gap: requirements.minimum_training_hours - reservist.total_training_hours
    };
  }
  
  // 2. Required Trainings Count (20 points)
  const requiredTrainingsCount = requirements.number_of_trainings;
  const completedTrainingsCount = reservist.completed_trainings.length;
  if (completedTrainingsCount >= requiredTrainingsCount) {
    score += 20;
    criteriaResults.training_count = { met: true, score: 20 };
  } else {
    criteriaResults.training_count = {
      met: false,
      score: 0,
      current: completedTrainingsCount,
      required: requiredTrainingsCount,
      gap: requiredTrainingsCount - completedTrainingsCount
    };
  }
  
  // 3. Camp Duty Days (20 points)
  const campDutyMet = reservist.total_camp_duty_days >= requirements.camp_duty_days;
  if (campDutyMet) {
    score += 20;
    criteriaResults.camp_duty = { met: true, score: 20 };
  } else {
    criteriaResults.camp_duty = {
      met: false,
      score: 0,
      current: reservist.total_camp_duty_days,
      required: requirements.camp_duty_days,
      gap: requirements.camp_duty_days - reservist.total_camp_duty_days
    };
  }
  
  // 4. Years Active (15 points)
  const yearsInRank = calculateYearsInRank(reservist.current_rank_date);
  const yearsActiveMet = yearsInRank >= requirements.years_active;
  if (yearsActiveMet) {
    score += 15;
    criteriaResults.years_active = { met: true, score: 15 };
  } else {
    criteriaResults.years_active = {
      met: false,
      score: 0,
      current: yearsInRank,
      required: requirements.years_active,
      gap: requirements.years_active - yearsInRank
    };
  }
  
  // 5. Seminars/Activities (15 points)
  const seminarsMet = reservist.completed_seminars.length >= requirements.seminars_required;
  if (seminarsMet) {
    score += 15;
    criteriaResults.seminars = { met: true, score: 15 };
  } else {
    criteriaResults.seminars = {
      met: false,
      score: 0,
      current: reservist.completed_seminars.length,
      required: requirements.seminars_required,
      gap: requirements.seminars_required - reservist.completed_seminars.length
    };
  }
  
  return {
    total_score: score,
    max_score: maxScore,
    percentage: (score / maxScore) * 100,
    is_eligible: score === maxScore,
    criteria_results: criteriaResults,
    next_rank: requirements.next_rank,
    recommendation: score === maxScore ? "ELIGIBLE FOR PROMOTION" : "NOT ELIGIBLE"
  };
}
```

---

### **Commissioned Officer Promotion Scoring System**

```javascript
function calculateCOPromotionEligibility(reservist) {
  const currentRank = reservist.current_rank;
  const requirements = CO_REQUIREMENTS[currentRank];
  
  let score = 0;
  let maxScore = 100;
  let criteriaResults = {};
  
  // 1. Educational Requirement (40 points) - MOST IMPORTANT FOR CO
  const hasRequiredEducation = checkEducationRequirement(
    reservist.educational_attainment,
    requirements.required_education
  );
  
  if (hasRequiredEducation) {
    score += 40;
    criteriaResults.education = { met: true, score: 40 };
  } else {
    criteriaResults.education = {
      met: false,
      score: 0,
      current: reservist.highest_education,
      required: requirements.required_education,
      message: `${requirements.required_education} is required to promote to ${requirements.next_rank}`
    };
  }
  
  // 2. Training Hours (25 points)
  const trainingHoursMet = reservist.total_training_hours >= requirements.minimum_training_hours;
  if (trainingHoursMet) {
    score += 25;
    criteriaResults.training_hours = { met: true, score: 25 };
  } else {
    criteriaResults.training_hours = {
      met: false,
      score: 0,
      current: reservist.total_training_hours,
      required: requirements.minimum_training_hours,
      gap: requirements.minimum_training_hours - reservist.total_training_hours
    };
  }
  
  // 3. Time in Grade (20 points) - From EO 212
  const yearsInRank = calculateYearsInRank(reservist.current_rank_date);
  const timeInGradeMet = yearsInRank >= requirements.minimum_years;
  if (timeInGradeMet) {
    score += 20;
    criteriaResults.time_in_grade = { met: true, score: 20 };
  } else {
    criteriaResults.time_in_grade = {
      met: false,
      score: 0,
      current: yearsInRank,
      required: requirements.minimum_years,
      gap: requirements.minimum_years - yearsInRank
    };
  }
  
  // 4. Active Duty Training (10 points) - From EO 212
  const hasActiveDuty = reservist.total_active_duty_days >= 21;
  const hasSatisfactoryRating = reservist.efficiency_rating !== "Unsatisfactory";
  if (hasActiveDuty && hasSatisfactoryRating) {
    score += 10;
    criteriaResults.active_duty = { met: true, score: 10 };
  } else {
    criteriaResults.active_duty = {
      met: false,
      score: 0,
      active_duty_days: reservist.total_active_duty_days,
      efficiency_rating: reservist.efficiency_rating
    };
  }
  
  // 5. Seminars (5 points)
  const seminarsMet = reservist.completed_seminars.length >= requirements.seminars_required;
  if (seminarsMet) {
    score += 5;
    criteriaResults.seminars = { met: true, score: 5 };
  } else {
    criteriaResults.seminars = {
      met: false,
      score: 0,
      current: reservist.completed_seminars.length,
      required: requirements.seminars_required
    };
  }
  
  return {
    total_score: score,
    max_score: maxScore,
    percentage: (score / maxScore) * 100,
    is_eligible: score === maxScore,
    criteria_results: criteriaResults,
    next_rank: requirements.next_rank,
    recommendation: score === maxScore ? "ELIGIBLE FOR PROMOTION" : "NOT ELIGIBLE",
    blocking_factors: identifyBlockingFactors(criteriaResults)
  };
}

// Helper function
function checkEducationRequirement(attainment, required) {
  const educationHierarchy = {
    "High School": 1,
    "Vocational": 2,
    "Bachelor's Degree": 3,
    "Master's Degree": 4,
    "Doctoral Degree": 5
  };
  
  const currentLevel = educationHierarchy[attainment] || 0;
  const requiredLevel = educationHierarchy[required] || 0;
  
  return currentLevel >= requiredLevel;
}
```

---

## 📊 **NCO REQUIREMENTS CONFIGURATION**

```javascript
const NCO_REQUIREMENTS = {
  "Private (PVT)": {
    next_rank: "Private First Class (PFC)",
    number_of_trainings: 0,
    minimum_training_hours: 0,
    camp_duty_days: 0,
    years_active: 0,
    seminars_required: 0,
    required_trainings: ["BMT Training", "Documentary Requirements"]
  },
  
  "Private First Class (PFC)": {
    next_rank: "Corporal (CPL)",
    number_of_trainings: 1,
    minimum_training_hours: 40, // Example: 1 training x 40 hours
    camp_duty_days: 30,
    years_active: 3,
    seminars_required: 3,
    required_trainings: ["Rifle Marksmanship"],
    required_seminars: ["Leadership 101", "Disaster Response", "Community Service"]
  },
  
  "Corporal (CPL)": {
    next_rank: "Sergeant (SGT)",
    number_of_trainings: 2,
    minimum_training_hours: 80, // Example: 2 trainings x 40 hours each
    camp_duty_days: 30,
    years_active: 2,
    seminars_required: 4,
    required_trainings: ["Rifle Marksmanship", "Combat Lifesaver Course"],
    required_seminars: ["Leadership", "First Aid", "Reserve Law", "Community Outreach"]
  },
  
  "Sergeant (SGT)": {
    next_rank: "Staff Sergeant (SSG)",
    number_of_trainings: 3,
    minimum_training_hours: 120, // Example: 3 trainings x 40 hours each
    camp_duty_days: 30,
    years_active: 1,
    seminars_required: 5,
    required_trainings: ["Rifle Marksmanship", "Combat Lifesaver", "Infantry Tactics"],
    required_seminars: ["Leadership", "Disaster Management", "Human Rights", "Reserve Integration", "Community Service"]
  }
};
```

---

## 📊 **COMMISSIONED OFFICER REQUIREMENTS CONFIGURATION**

```javascript
const CO_REQUIREMENTS = {
  "Second Lieutenant (2LT)": {
    next_rank: "First Lieutenant (1LT)",
    minimum_years: 2, // From EO 212 (Third Lieutenant equivalent)
    minimum_training_hours: 160,
    required_education: "Bachelor's Degree",
    seminars_required: 6,
    active_duty_days: 21,
    efficiency_rating: "Satisfactory"
  },
  
  "First Lieutenant (1LT)": {
    next_rank: "Captain (CPT)",
    minimum_years: 4, // From EO 212
    minimum_training_hours: 200,
    required_education: "Master's Degree", // CRITICAL REQUIREMENT
    seminars_required: 8,
    active_duty_days: 21,
    efficiency_rating: "Satisfactory",
    note: "Master's Degree is MANDATORY to promote to Captain"
  },
  
  "Captain (CPT)": {
    next_rank: "Major (MAJ)",
    minimum_years: 5, // From EO 212
    minimum_training_hours: 240,
    required_education: "Doctoral Degree (Ph.D.)", // CRITICAL REQUIREMENT
    seminars_required: 10,
    active_duty_days: 21,
    efficiency_rating: "Satisfactory",
    note: "Doctoral Degree is MANDATORY to promote to Major"
  },
  
  "Major (MAJ)": {
    next_rank: "Lieutenant Colonel (LTCOL)",
    minimum_years: 6, // From EO 212
    minimum_training_hours: 280,
    required_education: "Doctoral Degree (Ph.D.)",
    seminars_required: 12,
    active_duty_days: 21,
    efficiency_rating: "Satisfactory",
    note: "Doctoral Degree is MANDATORY to promote to Lieutenant Colonel"
  },
  
  "Lieutenant Colonel (LTCOL)": {
    next_rank: "Colonel (COL)",
    minimum_years: 7, // From EO 212
    minimum_training_hours: 320,
    required_education: "Doctoral Degree (Ph.D.)",
    seminars_required: 15,
    active_duty_days: 21,
    efficiency_rating: "Satisfactory",
    note: "Extensive experience and exceptional performance required"
  }
};
```

---

## 🎯 **DEVELOPMENT PRIORITIES**

### **Phase 1: NCO System (Priority 1 - Start Here)**

✅ **Must-Have Features:**
1. Commission Type field (NCO vs CO)
2. Training Hours tracking (not just training count!)
3. Camp Duty tracking (30-day requirement)
4. Years Active calculation
5. Seminars/Activities tracking
6. NCO promotion algorithm
7. Dynamic requirements configuration (Super Admin)

**Timeline:** 4-6 weeks

---

### **Phase 2: Commissioned Officer System**

✅ **Must-Have Features:**
1. Educational attainment verification
2. Master's Degree check (Captain promotion)
3. Doctoral Degree check (Major/LtCol promotion)
4. CO promotion algorithm (with education weight)
5. EO 212 integration (time in grade, active duty)
6. Rank-skipping logic (if approved)

**Timeline:** 4-6 weeks

---

### **Phase 3: Account Management Hierarchy**

✅ **Must-Have Features:**
1. Super Admin creates Administrator accounts
2. Administrator creates Staff accounts
3. Staff registers Reservist accounts
4. Proper activation/deactivation workflow
5. Super Admin oversight of ALL accounts

**Timeline:** 2-3 weeks

---

### **Phase 4: Mobile RIDS**

✅ **Must-Have Features:**
1. Part-by-part form completion
2. Auto-save drafts
3. Camera integration (photo, thumbmark, signature)
4. Offline mode
5. Generate official RIDS template PDF

**Timeline:** 4-5 weeks

---

## 📱 **UI/UX RECOMMENDATIONS**

### **Training Hours Display**

Instead of showing:
```
❌ Trainings Completed: 3
```

Show:
```
✅ Training Hours: 120 / 150 hours
   Progress: 80%
   
   Breakdown:
   • Rifle Marksmanship: 40 hours
   • Combat Lifesaver: 40 hours  
   • Infantry Tactics: 40 hours
   
   Remaining: 30 hours needed
```

---

### **Promotion Eligibility Card**

```
┌─────────────────────────────────────────┐
│ Promotion Eligibility: CPL → SGT        │
├─────────────────────────────────────────┤
│ Overall Score: 80 / 100 (80%)           │
│ Status: NOT ELIGIBLE                    │
├─────────────────────────────────────────┤
│ ✅ Training Hours: 120 / 120 (30 pts)   │
│ ✅ Training Count: 3 / 3 (20 pts)       │
│ ✅ Camp Duty: 30 / 30 days (20 pts)     │
│ ❌ Years Active: 1.5 / 2 years (0 pts)  │
│ ✅ Seminars: 4 / 4 (15 pts)             │
├─────────────────────────────────────────┤
│ Missing: 0.5 years of active service    │
│ Estimated Eligible: June 2025           │
└─────────────────────────────────────────┘
```

---

## 🔐 **API ENDPOINTS**

### **Training Hours Management**

```
POST   /api/training/add-with-hours
Body: {
  "reservist_id": "AFP-2024-12345",
  "training_name": "Rifle Marksmanship",
  "training_hours": 40,
  "completion_date": "2025-03-15"
}

GET    /api/reservist/:id/total-training-hours
Response: {
  "total_hours": 120,
  "breakdown": {...}
}

PUT    /api/admin/training-requirements/update
Body: {
  "year": 2025,
  "rank": "Corporal",
  "minimum_training_hours": 100
}
```

### **Commission Type Management**

```
GET    /api/reservist/:id/commission-type
Response: { "commission_type": "NCO" }

POST   /api/promotion/check-eligibility
Body: { "reservist_id": "AFP-2024-12345" }
Response: { "eligibility_result": {...} }
```

---

## ✅ **TESTING CHECKLIST**

### **NCO Promotion Logic**
- [ ] Private → PFC promotion check
- [ ] PFC → Corporal promotion check (3 years, 1 training, 30 days, 3 seminars)
- [ ] Corporal → Sergeant promotion check (2 years, 2 trainings, 30 days, 4 seminars)
- [ ] Sergeant → Staff Sergeant check (1 year, 3 trainings, 30 days, 5 seminars)
- [ ] Training HOURS calculation (not just count)
- [ ] Camp duty accumulation
- [ ] Seminar tracking

### **Commissioned Officer Promotion Logic**
- [ ] 2LT → 1LT check
- [ ] 1LT → Captain check (Master's Degree required!)
- [ ] Captain → Major check (Doctoral Degree required!)
- [ ] Major → LtCol check (Doctoral Degree required!)
- [ ] Educational verification system
- [ ] EO 212 integration (time in grade, active duty)

### **Account Management**
- [ ] Super Admin creates Administrator account
- [ ] Administrator creates Staff account
- [ ] Staff registers Reservist account
- [ ] Super Admin activates/deactivates Administrator
- [ ] Administrator activates/deactivates Staff
- [ ] Proper permission enforcement

### **Dynamic Requirements**
- [ ] Super Admin can update training hour requirements
- [ ] Requirements change per year
- [ ] System adapts to new requirements
- [ ] Historical requirements preserved

---

## 📚 **SUMMARY**

### **Critical Takeaways:**

1. ⭐ **START WITH NCO** - Build NCO promotion system first
2. 🕐 **TRAINING HOURS** - Not training count, but HOURS is what matters
3. 🎓 **EDUCATION CRITICAL** - Master's for Captain, Doctorate for Major+
4. 🔄 **DYNAMIC REQUIREMENTS** - Must be configurable yearly
5. 💰 **NOT AUTOMATIC** - System tracks eligibility, humans decide promotion
6. 👥 **ACCOUNT HIERARCHY** - Super Admin → Admin → Staff → Reservist
7. 📱 **MOBILE RIDS** - Part-by-part completion, print official template

---

**Document Version:** 1.0  
**Last Updated:** March 2025  
**Based on:** Client interview notes, requirement images, and system specifications  
**For:** Centralized Reservist Management System - 301st Community Defense Center
