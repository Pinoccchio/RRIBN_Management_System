# RIDS (Reservist Information Data Sheet) Implementation Guide
## Philippine Army Reservist Information Data Sheet

---

## **DOCUMENT OVERVIEW**

**Form Name:** Reservist Information Data Sheet (RIDS)  
**Organization:** Philippine Army  
**Purpose:** Official record of reservist personnel information  
**Submission:** 
- Email: arescom.rmis@gmail.com
- Physical: Nearest CDC/RCDG/ARESCOM
- File Location: HQS ARPMC(P), ARESCOM (Master Personnel File)

**Note:** Supporting documents must be attached for validation

---

## **COMPLETE FORM STRUCTURE**

The RIDS form is divided into **12 major sections** that capture comprehensive reservist information.

---

## **SECTION 1: RESERVIST PERSONNEL INFORMATION**

### **Basic Identification**

| Field | Type | Required | Options/Format |
|-------|------|----------|----------------|
| **Rank** | Dropdown | ✓ | Third Lieutenant, Second Lieutenant, First Lieutenant, Captain, Major, Lieutenant Colonel, Colonel |
| **Last Name** | Text | ✓ | - |
| **First Name** | Text | ✓ | - |
| **Middle Name** | Text | ✓ | - |
| **AFPSN** | Text (Unique ID) | ✓ | Armed Forces Philippines Service Number |
| **BrSVC** | Dropdown | ✓ | Branch of Service |

### **AFPOS / MOS (Armed Forces Position / Military Occupational Specialty)**

**Checkboxes (Select One):**
- ☐ INF (Infantry)
- ☐ CAV (Cavalry)
- ☐ FA (Field Artillery)
- ☐ SC (Signal Corps)
- ☐ QMS (Quartermaster Service)
- ☐ MI (Military Intelligence)
- ☐ AGS (Adjutant General Service)
- ☐ FS (Finance Service)
- ☐ RES (Reserve)
- ☐ GSC (General Staff Corps)
- ☐ MNSA (Military Non-Scholarship Agreement)

### **Source of Commission / Enlistment**

**Checkboxes (Select One):**
- ☐ MNSA (Military Non-Scholarship Agreement)
- ☐ ELECTED
- ☐ PRES APPOINTEE (Presidential Appointee)
- ☐ DEGREE HOLDER
- ☐ MS-43
- ☐ POTC (Pre-Officer Training Course)
- ☐ CBT COMMISSION (Combat Commission)
- ☐ EX-AFP (Ex-Armed Forces Philippines)
- ☐ ROTC (Reserve Officers' Training Corps)
- ☐ CMT (Citizen Military Training)
- ☐ BCMT (Basic Citizen Military Training)
- ☐ SBCMT (Short Basic Citizen Military Training)
- ☐ CAA (CAFGU) - Civilian Armed Forces Geographical Unit
- ☐ MOT (PAARU) - Military Observers Training

### **Commission/Enlistment Details**

| Field | Type | Required | Format |
|-------|------|----------|--------|
| **Initial Rank** | Dropdown | ✓ | Starting rank at commission |
| **Date of Comsn/Enlist** | Date | ✓ | dd-mmm-yyyy |
| **Authority** | Text | ✓ | Authorization document reference |

### **Reservist Classification**

**Checkboxes (Select One):**
- ☐ **READY** - Active and available for deployment
- ☐ **STANDBY** - In reserve status, not immediately available
- ☐ **RETIRED** - Separated from active reserve service

### **Mobilization Center**

| Field | Type | Required |
|-------|------|----------|
| **Mobilization Center** | Text/Dropdown | ✓ |

### **Unit Organization**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Designation** | Text | ✓ | Role/Position |
| **Squad/Team/Section** | Text | ○ | Smallest unit |
| **Platoon** | Text | ○ | Tactical unit |
| **Company** | Dropdown | ✓ | Alpha, Bravo, Charlie, HQ, Signal, FAB |
| **Battalion/Brigade/Division** | Text | ✓ | Higher command unit |

### **Uniform/Equipment Sizing**

| Field | Type | Required | Format |
|-------|------|----------|--------|
| **Size of Combat Shoes** | Number | ✓ | US/Philippine shoe size |
| **Size of Cap** | Number | ✓ | Centimeters (cm) |
| **Size of BDA** | Text | ✓ | Battle Dress Attire size (S, M, L, XL, etc.) |

---

## **SECTION 2: PERSONAL INFORMATION**

### **Employment Information**

| Field | Type | Required |
|-------|------|----------|
| **Present Occupation** | Text | ○ |
| **Company Name & Address** | Text Area | ○ |
| **Office Tel Nr** | Text | ○ |

### **Residential Information**

| Field | Type | Required | Format |
|-------|------|----------|--------|
| **Home Address: Street/Barangay** | Text | ✓ | Full street address |
| **Town/City/Province/ZIP Code** | Text | ✓ | Complete location |
| **Res.Tel.Nr** | Text | ○ | Residential telephone |
| **Mobile Tel Nr** | Text | ✓ | Primary contact number |

### **Personal Details**

| Field | Type | Required | Format |
|-------|------|----------|--------|
| **Birthdate** | Date | ✓ | dd-mmm-yyyy |
| **Birth Place** | Text | ✓ | Municipality, Province |
| **Age** | Number | ✓ | Auto-calculated from birthdate |
| **Religion** | Text | ✓ | - |
| **Blood Type** | Dropdown | ✓ | A+, A-, B+, B-, AB+, AB-, O+, O- |

### **Government IDs**

| Field | Type | Required | Format |
|-------|------|----------|--------|
| **T.I.N.** | Text | ✓ | Tax Identification Number |
| **SSS Nr** | Text | ✓ | Social Security System Number |
| **PHILHEALTH Nr** | Text | ✓ | Philippine Health Insurance Number |

### **Physical Information**

| Field | Type | Required | Unit |
|-------|------|----------|------|
| **Height** | Number | ✓ | Centimeters (cm) |
| **Weight** | Number | ✓ | Kilograms (kgs) |

### **Marital Status**

**Radio Buttons (Select One):**
- ○ Single
- ○ Married
- ○ Widow
- ○ Separated

### **Sex**

**Radio Buttons (Select One):**
- ○ Male
- ○ Female

### **Digital Presence**

| Field | Type | Required |
|-------|------|----------|
| **FB Account** | Text | ○ |
| **Email Address** | Email | ✓ |

### **Additional Information**

| Field | Type | Required |
|-------|------|----------|
| **Special Skills** | Text Area | ○ |
| **Language/Dialect Spoken** | Text Area | ○ |

---

## **SECTION 3: PROMOTION/DEMOTION**

**Table Structure** (Multiple Entries - Historical Record)

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| **Entry Number** | Auto-increment | ✓ | 1, 2, 3... |
| **Rank** | Dropdown | ✓ | Rank achieved or demoted from |
| **Date of Rank** | Date | ✓ | dd-mmm-yyyy |
| **Authority** | Text | ✓ | Authorization reference document |

**System Notes:**
- First entry should match Initial Rank from Section 1
- Each subsequent entry represents a promotion or demotion
- Most recent rank should match current rank
- Used for calculating "Years in Grade" for EO 212 compliance

---

## **SECTION 4: MILITARY TRAINING/SEMINAR/SCHOOLING**

**Table Structure** (Multiple Entries)

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| **Military Schooling** | Text | ✓ | Name of training/course |
| **School** | Text | ✓ | Institution/Training center |
| **Date Graduated** | Date | ✓ | dd-mmm-yyyy |

**Examples:**
- Basic Citizen Military Training (BCMT)
- Officer Basic Course (OBC)
- Command and Staff Course
- Airborne Course
- Combat Lifesaver Course
- Leadership Development Course

**Linked to:** EO 212 Criterion (d) - Educational Courses Requirement

---

## **SECTION 5: AWARDS AND DECORATION**

**Table Structure** (Multiple Entries)

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| **Awards/Decoration** | Text | ✓ | Name of award/medal |
| **Authority** | Text | ✓ | Issuing authority |
| **Date Awarded** | Date | ✓ | dd-mmm-yyyy |

**Examples of Philippine Military Awards:**
- Medal of Valor
- Distinguished Conduct Star
- Military Merit Medal
- Distinguished Service Star
- Gold Cross Medal
- Wounded Personnel Medal
- Military Commendation Medal
- Gawad sa Kaunlaran (Peace & Development Award)

---

## **SECTION 6: DEPENDENTS**

**Table Structure** (Multiple Entries)

| Column | Type | Required | Options |
|--------|------|----------|---------|
| **Relation** | Dropdown | ✓ | Spouse, Son, Daughter, Father, Mother, Sibling |
| **Name** | Text | ✓ | Full name of dependent |

**System Notes:**
- Used for family support documentation
- Important for benefits and emergency contacts
- Can be multiple entries per reservist

---

## **SECTION 7: HIGHEST EDUCATIONAL ATTAINMENT**

**Table Structure** (Single or Multiple Entries)

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| **Course** | Text | ✓ | Degree/Program name |
| **School** | Text | ✓ | Educational institution |
| **Date Graduated** | Date | ✓ | dd-mmm-yyyy |

**Examples:**
- Bachelor of Science in Information Technology
- Bachelor of Arts in Political Science
- High School Graduate
- Vocational Course in Automotive Technology
- Master of Business Administration

**System Notes:**
- Can affect eligibility for certain positions
- May be required for commission eligibility
- Important for specialized assignments

---

## **SECTION 8: CAD/OJT/ADT (Call to Active Duty / On-the-Job Training / Active Duty Training)**

**Table Structure** (Multiple Entries)

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| **Unit** | Text | ✓ | Unit where training was conducted |
| **Purpose / Authority** | Text | ✓ | Reason for active duty / Authorization |
| **Date Start** | Date | ✓ | dd-mmm-yyyy |
| **Date End** | Date | ✓ | dd-mmm-yyyy |

**Linked to:** EO 212 Criterion (e) - Active Duty Training Requirement (minimum 21 days)

**System Calculations:**
```javascript
active_duty_days = (Date_End - Date_Start) + 1
total_active_duty = sum(all_active_duty_days)
```

**System Notes:**
- Critical for promotion eligibility
- Must accumulate at least 21 days per promotion cycle
- Each entry should have corresponding efficiency report

---

## **SECTION 9: UNIT ASSIGNMENT**

**Table Structure** (Multiple Entries - Historical Record)

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| **Unit** | Text | ✓ | Unit/Company assigned to |
| **Authority** | Text | ✓ | Authorization document |
| **Date From** | Date | ✓ | dd-mmm-yyyy |
| **Date To** | Date | ✓ | dd-mmm-yyyy (blank if current) |

**Examples:**
- 301st Ready Reserve Infantry Battalion
- Alpha Company, 301st RRIBn
- Bravo Company, 301st RRIBn

**System Notes:**
- Tracks unit transfer history
- Current assignment should have blank "Date To"
- Important for chain of command and reporting

---

## **SECTION 10: DESIGNATION**

**Table Structure** (Multiple Entries - Historical Record)

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| **Position** | Text | ✓ | Role/Job title |
| **Authority** | Text | ✓ | Authorization document |
| **Date From** | Date | ✓ | dd-mmm-yyyy |
| **Date To** | Date | ✓ | dd-mmm-yyyy (blank if current) |

**Examples:**
- Platoon Leader
- Squad Leader
- Company Executive Officer
- S1 Officer (Personnel)
- S2 Officer (Intelligence)
- S3 Officer (Operations)
- S4 Officer (Logistics)

**System Notes:**
- Tracks career progression and leadership roles
- Current position should have blank "Date To"
- Used for experience assessment

---

## **SECTION 11: CERTIFICATION & BIOMETRICS**

### **Required Attachments**

| Item | Type | Required | Specifications |
|------|------|----------|----------------|
| **2x2 Photo** | Image | ✓ | Recent photograph, 2x2 inches, white background |
| **Right Thumbmark** | Biometric | ✓ | Clear thumbprint impression |
| **Signature** | Image/Scan | ✓ | Reservist's signature |

### **Certification Statement**

**Text:** "I HEREBY CERTIFY that all entries in this document are correct."

**Required:**
- Reservist signature
- Date of certification

---

## **SECTION 12: ATTESTATION**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Attesting Personnel** | Text | ✓ | Name, rank, and signature of verifying officer |

**System Notes:**
- Staff member who verified the information
- Adds accountability and validation
- Creates audit trail

---

## **DATABASE SCHEMA FOR RIDS**

### **🔴 CURRENT SYSTEM: SUPABASE POSTGRESQL 🔴**

> **Updated October 2025 - Next.js 15 + Supabase Architecture**

The current system uses **Supabase PostgreSQL** with Row-Level Security (RLS), **NOT MongoDB**. RIDS data is stored across multiple related tables following a relational database design with proper foreign keys, constraints, and RLS policies.

### **Primary Database Schema: Supabase PostgreSQL** ✅

> **THIS IS THE ACTIVE SCHEMA - Use this for all RIDS development**

**Implementation Status:**
- ✅ Core `reservist_details` table exists (see `src/lib/supabase/database.types.ts`)
- ⏳ RIDS-specific tables below are planned extensions
- 🔄 Will be implemented progressively as features are developed

```sql
-- Main RIDS Record Table
CREATE TABLE public.rids_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservist_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  rids_id TEXT UNIQUE NOT NULL, -- e.g., RIDS-2025-12345
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'verified', 'rejected')),
  created_date TIMESTAMPTZ DEFAULT now(),
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.accounts(id),
  verified_by UUID REFERENCES public.accounts(id),
  verified_date TIMESTAMPTZ,

  -- Section 1: Personnel Information (extended from reservist_details)
  rank TEXT,
  afpsn TEXT, -- Armed Forces Philippines Service Number
  br_svc TEXT, -- Branch of Service
  afpos_mos JSONB, -- { category: string, code: string }
  source_of_commission JSONB, -- { type: string, details: string }
  commission_details JSONB, -- { initial_rank, date_of_commission, authority }
  reservist_classification TEXT CHECK (reservist_classification IN ('READY', 'STANDBY', 'RETIRED')),
  mobilization_center TEXT,
  unit_organization JSONB, -- { designation, squad, platoon, company, battalion }
  uniform_sizing JSONB, -- { combat_shoes_size, cap_size_cm, bda_size }

  -- Section 2: Personal Information (extended from profiles + reservist_details)
  employment JSONB, -- { occupation, company_name, company_address, office_tel }
  residential JSONB, -- { street, town_city, zip, tel, mobile }
  personal_details JSONB, -- { birthdate, birth_place, age, religion, blood_type }
  government_ids JSONB, -- { tin, sss_number, philhealth_number }
  physical_info JSONB, -- { height_cm, weight_kg }
  marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Widow', 'Separated')),
  sex TEXT CHECK (sex IN ('Male', 'Female')),
  digital_presence JSONB, -- { fb_account, email_address }
  additional_info JSONB, -- { special_skills: string[], languages: string[] }

  -- Section 11: Biometrics
  photo_url TEXT, -- Supabase Storage path
  thumbmark_url TEXT, -- Supabase Storage path
  signature_url TEXT, -- Supabase Storage path

  -- Certification
  is_certified BOOLEAN DEFAULT false,
  certification_date TIMESTAMPTZ,

  -- Attestation
  attesting_personnel JSONB, -- { name, rank, position, user_id }
  attestation_date TIMESTAMPTZ,
  attestation_signature TEXT,
  verification_notes TEXT,

  -- Submission
  submission_method TEXT CHECK (submission_method IN ('email', 'physical', 'online_portal')),
  submission_date TIMESTAMPTZ,
  submitted_to TEXT,
  email_confirmation TEXT,
  tracking_number TEXT,

  -- File references
  mpf_location TEXT,
  archive_status TEXT DEFAULT 'active' CHECK (archive_status IN ('active', 'archived', 'deleted')),

  CONSTRAINT rids_reservist_unique UNIQUE (reservist_id, version)
);

-- Indexes
CREATE INDEX idx_rids_reservist ON rids_records(reservist_id);
CREATE INDEX idx_rids_status ON rids_records(status);
CREATE INDEX idx_rids_classification ON rids_records(reservist_classification);

-- Enable RLS
ALTER TABLE public.rids_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "rids_select_policy" ON public.rids_records
  FOR SELECT USING (
    -- Super admin sees all
    (auth.jwt() ->> 'role')::text = 'super_admin'
    -- Admin/Staff see RIDS in their companies
    OR (
      (auth.jwt() ->> 'role')::text IN ('admin', 'staff')
      AND (unit_organization->>'company') IN (
        SELECT unnest(assigned_companies) FROM staff_details WHERE id = auth.uid()
      )
    )
    -- Reservists see their own RIDS
    OR reservist_id = auth.uid()
  );

-- Section 3: Promotion History
CREATE TABLE public.rids_promotion_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rids_record_id UUID NOT NULL REFERENCES public.rids_records(id) ON DELETE CASCADE,
  entry_number INTEGER NOT NULL,
  rank TEXT NOT NULL,
  date_of_rank DATE NOT NULL,
  authority TEXT NOT NULL,
  action_type TEXT CHECK (action_type IN ('Promotion', 'Demotion', 'Initial Commission')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT promotion_entry_unique UNIQUE (rids_record_id, entry_number)
);

-- Section 4: Military Training
CREATE TABLE public.rids_military_training (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rids_record_id UUID NOT NULL REFERENCES public.rids_records(id) ON DELETE CASCADE,
  training_id TEXT,
  training_name TEXT NOT NULL,
  school TEXT NOT NULL,
  date_graduated DATE NOT NULL,
  certificate_number TEXT,
  training_category TEXT, -- Basic, Advanced, Specialized
  duration_days INTEGER,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('verified', 'pending', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Section 5: Awards and Decorations
CREATE TABLE public.rids_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rids_record_id UUID NOT NULL REFERENCES public.rids_records(id) ON DELETE CASCADE,
  award_id TEXT,
  award_name TEXT NOT NULL,
  authority TEXT NOT NULL,
  date_awarded DATE NOT NULL,
  citation TEXT,
  award_category TEXT, -- Medal, Ribbon, Certificate
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Section 6: Dependents
CREATE TABLE public.rids_dependents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rids_record_id UUID NOT NULL REFERENCES public.rids_records(id) ON DELETE CASCADE,
  dependent_id TEXT,
  relation TEXT NOT NULL CHECK (relation IN ('Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Sibling')),
  full_name TEXT NOT NULL,
  birthdate DATE,
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Section 7: Educational Attainment
CREATE TABLE public.rids_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rids_record_id UUID NOT NULL REFERENCES public.rids_records(id) ON DELETE CASCADE,
  education_id TEXT,
  course TEXT NOT NULL,
  school TEXT NOT NULL,
  date_graduated DATE NOT NULL,
  level TEXT CHECK (level IN ('High School', 'Vocational', 'College', 'Graduate - Masters', 'Graduate - Doctorate')),
  honors TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Section 8: Active Duty Training (CAD/OJT/ADT)
CREATE TABLE public.rids_active_duty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rids_record_id UUID NOT NULL REFERENCES public.rids_records(id) ON DELETE CASCADE,
  adt_id TEXT,
  unit TEXT NOT NULL,
  purpose TEXT NOT NULL,
  authority TEXT NOT NULL,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  days_served INTEGER GENERATED ALWAYS AS (date_end - date_start + 1) STORED,
  efficiency_report JSONB, -- { report_number, rating, evaluator, remarks }
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Section 9: Unit Assignment History
CREATE TABLE public.rids_unit_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rids_record_id UUID NOT NULL REFERENCES public.rids_records(id) ON DELETE CASCADE,
  assignment_id TEXT,
  unit TEXT NOT NULL,
  authority TEXT NOT NULL,
  date_from DATE NOT NULL,
  date_to DATE,
  is_current BOOLEAN DEFAULT false,
  assignment_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Section 10: Designation History
CREATE TABLE public.rids_designations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rids_record_id UUID NOT NULL REFERENCES public.rids_records(id) ON DELETE CASCADE,
  designation_id TEXT,
  position TEXT NOT NULL,
  authority TEXT NOT NULL,
  date_from DATE NOT NULL,
  date_to DATE,
  is_current BOOLEAN DEFAULT false,
  responsibilities TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Supporting Documents
CREATE TABLE public.rids_supporting_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rids_record_id UUID NOT NULL REFERENCES public.rids_records(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage path
  file_name TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT now(),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.accounts(id),
  verified_date TIMESTAMPTZ
);

-- Audit Trail for RIDS
CREATE TABLE public.rids_audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rids_record_id UUID NOT NULL REFERENCES public.rids_records(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- Created, Updated, Verified, Rejected
  performed_by UUID REFERENCES public.accounts(id),
  timestamp TIMESTAMPTZ DEFAULT now(),
  changes_made JSONB,
  reason TEXT
);

-- TypeScript Type Definition (for reference)
-- See src/lib/supabase/database.types.ts for actual types
```

### **Migration from Current Schema:**

The current system has a basic `reservist_details` table. When implementing full RIDS:
1. Extend `reservist_details` or create `rids_records` table
2. Migrate existing reservist data to RIDS format
3. Implement related tables for history tracking
4. Set up Supabase Storage buckets for biometric files
5. Configure RLS policies for all RIDS tables

### **⚠️ DEPRECATED: Legacy MongoDB Schema (For Reference Only) ⚠️**

> **🔴 DO NOT USE THIS SCHEMA 🔴**
>
> This MongoDB schema is **DEPRECATED** and kept for historical reference only.
>
> **Current System Uses:**
> - **Database**: Supabase PostgreSQL (see Primary Database Schema above)
> - **Backend**: Next.js 15 API Routes (NOT Express.js)
> - **Frontend**: Next.js 15 with React Server Components
> - **Auth**: Supabase Auth with Row-Level Security (RLS)
> - **File Storage**: Supabase Storage (NOT local filesystem)
>
> **For all new RIDS development, use the Supabase PostgreSQL schema defined above.**

```javascript
// ⚠️ WARNING: This is the OLD MongoDB schema - NOT USED in current system
// Current system uses Supabase PostgreSQL (see SQL schema above)
// Last updated: Pre-October 2025 (deprecated)
const RIDSSchema_LEGACY = {
  // Document Metadata
  rids_id: String, // Unique RIDS identifier
  version: Number, // Document version for tracking updates
  status: String, // "Draft", "Submitted", "Verified", "Rejected"
  created_date: Date,
  last_updated: Date,
  created_by: String, // User ID who created
  verified_by: String, // Staff/Admin who verified
  
  // SECTION 1: RESERVIST PERSONNEL INFORMATION
  personnel_info: {
    rank: String, // Current rank
    last_name: String,
    first_name: String,
    middle_name: String,
    afpsn: String, // Unique service number
    br_svc: String, // Branch of service
    
    afpos_mos: {
      category: String, // INF, CAV, FA, SC, QMS, MI, AGS, FS, RES, GSC, MNSA
      code: String // Specific MOS code
    },
    
    source_of_commission: {
      type: String, // MNSA, ELECTED, PRES APPOINTEE, etc.
      details: String
    },
    
    commission_details: {
      initial_rank: String,
      date_of_commission: Date,
      authority: String // Authorization document reference
    },
    
    reservist_classification: String, // READY, STANDBY, RETIRED
    mobilization_center: String,
    
    unit_organization: {
      designation: String,
      squad_team_section: String,
      platoon: String,
      company: String, // Alpha, Bravo, Charlie, HQ, Signal, FAB
      battalion_brigade_division: String
    },
    
    uniform_sizing: {
      combat_shoes_size: Number,
      cap_size_cm: Number,
      bda_size: String
    }
  },
  
  // SECTION 2: PERSONAL INFORMATION
  personal_info: {
    employment: {
      present_occupation: String,
      company_name: String,
      company_address: String,
      office_tel: String
    },
    
    residential: {
      street_barangay: String,
      town_city_province: String,
      zip_code: String,
      residential_tel: String,
      mobile_tel: String // Primary contact
    },
    
    personal_details: {
      birthdate: Date,
      birth_place: String, // Municipality, Province
      age: Number, // Auto-calculated
      religion: String,
      blood_type: String // A+, A-, B+, B-, AB+, AB-, O+, O-
    },
    
    government_ids: {
      tin: String, // Tax Identification Number
      sss_number: String,
      philhealth_number: String
    },
    
    physical_info: {
      height_cm: Number,
      weight_kg: Number
    },
    
    marital_status: String, // Single, Married, Widow, Separated
    sex: String, // Male, Female
    
    digital_presence: {
      fb_account: String,
      email_address: String // Required
    },
    
    additional_info: {
      special_skills: [String],
      languages_spoken: [String]
    }
  },
  
  // SECTION 3: PROMOTION/DEMOTION HISTORY
  promotion_history: [
    {
      entry_number: Number,
      rank: String,
      date_of_rank: Date,
      authority: String,
      action_type: String, // "Promotion", "Demotion", "Initial Commission"
      notes: String
    }
  ],
  
  // SECTION 4: MILITARY TRAINING/SEMINAR/SCHOOLING
  military_training: [
    {
      training_id: String,
      training_name: String,
      school: String, // Institution
      date_graduated: Date,
      certificate_number: String,
      training_category: String, // Basic, Advanced, Specialized, etc.
      duration_days: Number,
      verification_status: String // "Verified", "Pending", "Rejected"
    }
  ],
  
  // SECTION 5: AWARDS AND DECORATION
  awards_decorations: [
    {
      award_id: String,
      award_name: String,
      authority: String,
      date_awarded: Date,
      citation: String,
      award_category: String // Medal, Ribbon, Certificate, etc.
    }
  ],
  
  // SECTION 6: DEPENDENTS
  dependents: [
    {
      dependent_id: String,
      relation: String, // Spouse, Son, Daughter, Father, Mother, Sibling
      full_name: String,
      birthdate: Date,
      contact_info: String
    }
  ],
  
  // SECTION 7: HIGHEST EDUCATIONAL ATTAINMENT
  educational_attainment: [
    {
      education_id: String,
      course: String,
      school: String,
      date_graduated: Date,
      level: String, // High School, College, Vocational, Graduate
      honors: String
    }
  ],
  
  // SECTION 8: CAD/OJT/ADT (Active Duty Training)
  active_duty_training: [
    {
      adt_id: String,
      unit: String,
      purpose: String,
      authority: String,
      date_start: Date,
      date_end: Date,
      days_served: Number, // Auto-calculated
      efficiency_report: {
        report_number: String,
        rating: String, // Excellent, Satisfactory, Unsatisfactory
        evaluator: String,
        remarks: String
      },
      verification_status: String
    }
  ],
  
  // Calculated field for EO 212
  total_active_duty_days: Number, // Sum of all days_served
  
  // SECTION 9: UNIT ASSIGNMENT HISTORY
  unit_assignments: [
    {
      assignment_id: String,
      unit: String,
      authority: String,
      date_from: Date,
      date_to: Date, // Null if current assignment
      is_current: Boolean,
      assignment_reason: String
    }
  ],
  
  // SECTION 10: DESIGNATION HISTORY
  designations: [
    {
      designation_id: String,
      position: String,
      authority: String,
      date_from: Date,
      date_to: Date, // Null if current position
      is_current: Boolean,
      responsibilities: [String]
    }
  ],
  
  // SECTION 11: BIOMETRICS & CERTIFICATION
  biometrics: {
    photo: {
      file_path: String,
      file_name: String,
      upload_date: Date,
      mime_type: String,
      file_size: Number
    },
    
    right_thumbmark: {
      file_path: String,
      file_name: String,
      upload_date: Date,
      mime_type: String
    },
    
    signature: {
      file_path: String,
      file_name: String,
      upload_date: Date,
      mime_type: String
    }
  },
  
  certification: {
    is_certified: Boolean,
    certification_text: String, // "I HEREBY CERTIFY..."
    certification_date: Date,
    reservist_signature: String // Digital signature or file path
  },
  
  // SECTION 12: ATTESTATION
  attestation: {
    attesting_personnel: {
      name: String,
      rank: String,
      position: String,
      user_id: String
    },
    attestation_date: Date,
    attestation_signature: String,
    verification_notes: String
  },
  
  // Supporting Documents
  supporting_documents: [
    {
      document_id: String,
      document_type: String, // "Birth Certificate", "Training Certificate", etc.
      file_path: String,
      file_name: String,
      upload_date: Date,
      verified: Boolean,
      verified_by: String,
      verified_date: Date
    }
  ],
  
  // Submission Information
  submission: {
    submission_method: String, // "Email", "Physical", "Online Portal"
    submission_date: Date,
    submitted_to: String, // CDC/RCDG/ARESCOM
    email_confirmation: String,
    tracking_number: String
  },
  
  // File References
  mpf_location: String, // Master Personnel File location (HQS ARPMC(P), ARESCOM)
  archive_status: String, // "Active", "Archived", "Deleted"
  
  // Audit Trail
  audit_trail: [
    {
      action: String, // "Created", "Updated", "Verified", "Rejected"
      performed_by: String,
      timestamp: Date,
      changes_made: Object, // Field-level change tracking
      reason: String
    }
  ]
};
```

---

## **FORM VALIDATION RULES**

### **Required Field Validation**

```javascript
const validationRules = {
  // Section 1
  "personnel_info.rank": { required: true },
  "personnel_info.last_name": { required: true },
  "personnel_info.first_name": { required: true },
  "personnel_info.middle_name": { required: true },
  "personnel_info.afpsn": { required: true, unique: true },
  "personnel_info.br_svc": { required: true },
  "personnel_info.afpos_mos.category": { required: true },
  "personnel_info.source_of_commission.type": { required: true },
  "personnel_info.commission_details.initial_rank": { required: true },
  "personnel_info.commission_details.date_of_commission": { required: true },
  "personnel_info.reservist_classification": { required: true },
  "personnel_info.unit_organization.company": { required: true },
  
  // Section 2
  "personal_info.residential.mobile_tel": { required: true },
  "personal_info.personal_details.birthdate": { required: true },
  "personal_info.personal_details.birth_place": { required: true },
  "personal_info.personal_details.religion": { required: true },
  "personal_info.personal_details.blood_type": { required: true },
  "personal_info.government_ids.tin": { required: true },
  "personal_info.government_ids.sss_number": { required: true },
  "personal_info.government_ids.philhealth_number": { required: true },
  "personal_info.physical_info.height_cm": { required: true, min: 140, max: 220 },
  "personal_info.physical_info.weight_kg": { required: true, min: 40, max: 150 },
  "personal_info.marital_status": { required: true },
  "personal_info.sex": { required: true },
  "personal_info.digital_presence.email_address": { required: true, format: "email" },
  
  // Section 11
  "biometrics.photo": { required: true },
  "biometrics.right_thumbmark": { required: true },
  "biometrics.signature": { required: true },
  "certification.is_certified": { required: true, value: true }
};
```

### **Data Format Validation**

```javascript
const formatValidation = {
  afpsn: /^AFP-\d{4}-\d{5}$/, // Example: AFP-2024-12345
  mobile_tel: /^(09|\+639)\d{9}$/, // Philippine mobile format
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  tin: /^\d{3}-\d{3}-\d{3}-\d{3}$/, // XXX-XXX-XXX-XXX
  sss_number: /^\d{2}-\d{7}-\d{1}$/, // XX-XXXXXXX-X
  philhealth_number: /^\d{12}$/,
  date: /^\d{2}-[A-Za-z]{3}-\d{4}$/ // dd-mmm-yyyy
};
```

---

## **WEB APPLICATION FEATURES FOR RIDS**

### **Staff/Admin Features**

1. **Create New RIDS**
   - Multi-step form wizard
   - Auto-save draft functionality
   - Field validation at each step
   - Support for file uploads (photo, thumbmark, signature)

2. **Manage RIDS**
   - Search reservist by name, AFPSN, company
   - Filter by status (Draft, Submitted, Verified, Rejected)
   - Bulk operations (export, print, delete)
   - Version history tracking

3. **View RIDS**
   - Full RIDS display in printable format
   - PDF export functionality
   - Edit mode (for corrections)
   - Audit trail viewing

4. **Verify RIDS**
   - Document verification checklist
   - Approve/Reject workflow
   - Add verification notes
   - Request additional documents

5. **RIDS Analytics**
   - Completion rate by company
   - Pending verifications dashboard
   - Missing information reports
   - Document expiry alerts

---

## **MOBILE APPLICATION FEATURES FOR RIDS**

### **Reservist Features**

1. **View My RIDS**
   - View current RIDS status
   - Download PDF copy
   - See verification status
   - View staff feedback/notes

2. **Update My RIDS** (Limited Fields)
   - Update contact information
   - Update residential address
   - Update email/mobile number
   - Upload new photo

3. **RIDS Notifications**
   - Alert when RIDS needs update
   - Notification when verified/rejected
   - Reminder for document renewals
   - Training completion updates

**Note:** Reservist cannot create or significantly modify RIDS. Major changes require staff intervention.

---

## **SYSTEM WORKFLOWS**

### **Workflow 1: New RIDS Creation (Staff)**

```
START
  ↓
Staff logs into system
  ↓
Navigate to "Create RIDS"
  ↓
Enter Section 1: Personnel Information
  ↓
Enter Section 2: Personal Information
  ↓
Enter Section 3-10: Service Records
  ↓
Upload Section 11: Biometrics (Photo, Thumbmark, Signature)
  ↓
Attach Supporting Documents
  ↓
Reservist Reviews & Certifies
  ↓
System Validates All Required Fields
  ↓
Submit for Verification
  ↓
Admin/Staff Reviews
  ↓
[Approve] → Status: VERIFIED → Notify Reservist
  ↓
[Reject] → Status: REJECTED → Request Corrections → Back to Staff
  ↓
Store in Database & Archive
  ↓
Send E-Copy to arescom.rmis@gmail.com
  ↓
END
```

### **Workflow 2: RIDS Update by Reservist (Mobile)**

```
START
  ↓
Reservist logs into mobile app
  ↓
Navigate to "My Profile" → "Update RIDS"
  ↓
Select editable fields (Contact info, Address, Photo)
  ↓
Make changes
  ↓
Upload new documents if needed
  ↓
Submit update request
  ↓
System creates update request ticket
  ↓
Staff receives notification
  ↓
Staff reviews changes
  ↓
[Approve] → Update RIDS → Notify Reservist
  ↓
[Reject] → Send feedback → Notify Reservist
  ↓
END
```

### **Workflow 3: RIDS Verification (Admin)**

```
START
  ↓
Admin receives RIDS submission notification
  ↓
Navigate to "Pending Verifications" dashboard
  ↓
Select RIDS to verify
  ↓
Review all sections
  ↓
Check supporting documents
  ↓
Verify biometrics (Photo, Thumbmark, Signature)
  ↓
Cross-check with existing records
  ↓
Run validation checks
  ↓
Decision Point:
  ├─ All Valid → APPROVE
  │    ↓
  │    Mark as "Verified"
  │    Sign attestation
  │    Send confirmation to reservist
  │    Archive in MPF
  │
  └─ Issues Found → REJECT
       ↓
       Add verification notes
       List required corrections
       Send back to staff/reservist
       Set status to "Rejected"
  ↓
END
```

---

## **INTEGRATION WITH EO 212 PROMOTION ALGORITHM**

### **RIDS Data Points Used in Promotion Eligibility**

```javascript
// Mapping RIDS to EO 212 Criteria
const promotionEligibilityMapping = {
  // Criterion (c): Time in Grade
  time_in_grade: {
    source: "promotion_history",
    calculation: "years_between(current_date, latest_promotion_date)"
  },
  
  // Criterion (d): Educational Courses
  educational_courses: {
    source: "military_training",
    filter: "training_category === 'Correspondence Course'",
    validation: "check_completion_for_target_rank"
  },
  
  // Criterion (e): Active Duty Training
  active_duty_training: {
    source: "active_duty_training",
    calculation: "sum(all_days_served)",
    minimum_required: 21,
    efficiency_rating_source: "active_duty_training.efficiency_report.rating",
    minimum_rating: "Satisfactory"
  },
  
  // Supporting Data
  current_rank: "personnel_info.rank",
  service_history: "promotion_history",
  total_commissioned_service: "sum(all_service_periods)"
};
```

### **Auto-Update Triggers**

When RIDS is updated, automatically trigger:
1. **Promotion eligibility re-calculation**
2. **Training requirements check**
3. **Document expiry alerts**
4. **Readiness status update**

---

## **PRINT/EXPORT FEATURES**

### **PDF Export Template**

The system should generate a PDF that matches the original RIDS form layout:
- Header: "PHILIPPINE ARMY - RESERVIST INFORMATION DATA SHEET"
- All 12 sections in proper format
- Embedded photo, thumbmark, signature
- Footer: Submission details, form version (s2019)
- Watermark: Status (VERIFIED, DRAFT, etc.)

### **Export Formats**

1. **PDF** - Official form format
2. **Excel/CSV** - For bulk data analysis
3. **JSON** - For system integration
4. **Printed Hard Copy** - Physical submission

---

## **SECURITY & PRIVACY**

### **Sensitive Data Protection**

**PII (Personally Identifiable Information):**
- Encrypt: AFPSN, TIN, SSS, PhilHealth numbers
- Mask display: Show last 4 digits only in lists
- Access control: Only authorized staff can view full details
- Audit all access to sensitive fields

**Biometric Data:**
- Store in secure file system (not in database)
- Encrypt files at rest
- Secure transmission (HTTPS/TLS)
- Access logging for compliance

### **Role-Based Access Control**

| Role | Create RIDS | View All RIDS | Edit RIDS | Verify RIDS | Delete RIDS |
|------|-------------|---------------|-----------|-------------|-------------|
| Reservist | ✗ | Own Only | Limited Fields | ✗ | ✗ |
| Staff | ✓ | Company Only | ✓ | Request Only | ✗ |
| Administrator | ✓ | All | ✓ | ✓ | ✗ |
| Super Admin | ✓ | All | ✓ | ✓ | ✓ |

---

## **API ENDPOINTS FOR RIDS (Next.js 15 API Routes)**

### **🔴 CURRENT IMPLEMENTATION - Updated October 2025 🔴**

> **Technology Stack:**
> - **Framework**: Next.js 15 with App Router
> - **API Pattern**: Route Handlers (`src/app/api/rids/*/route.ts`)
> - **Database**: Supabase PostgreSQL
> - **Auth**: Supabase Auth + Middleware protection
> - **Authorization**: Row-Level Security (RLS) policies
> - **File Uploads**: Supabase Storage buckets

### **API Route Structure:**
All RIDS routes are in: `src/app/api/rids/`

### **RIDS Management Endpoints**

```typescript
// Create new RIDS
POST /api/rids
Body: { reservist_id: string, ...rids_data }
Returns: { id: string, rids_id: string }

// Get RIDS by ID
GET /api/rids/[id]
Returns: { ...rids_record, related_data: {...} }

// Update RIDS
PUT /api/rids/[id]
Body: { ...updated_fields }
Returns: { success: boolean, updated_record: {...} }

// Soft delete RIDS
DELETE /api/rids/[id]
Returns: { success: boolean }

// Search RIDS with filters
GET /api/rids/search?status=draft&company=ALPHA&rank=Captain
Returns: { data: [...], count: number }

// Get all RIDS by company
GET /api/rids/company/[code]
Returns: { data: [...], count: number }

// Verify RIDS (Admin/Staff only)
POST /api/rids/[id]/verify
Body: { verification_notes?: string }
Returns: { success: boolean }

// Reject RIDS with notes
POST /api/rids/[id]/reject
Body: { rejection_reason: string }
Returns: { success: boolean }

// Export RIDS as PDF
GET /api/rids/[id]/pdf
Returns: PDF file (Content-Type: application/pdf)

// Bulk export RIDS
POST /api/rids/bulk-export
Body: { rids_ids: string[] }
Returns: ZIP file with multiple PDFs

// Get pending verifications
GET /api/rids/pending?company=ALPHA
Returns: { data: [...], count: number }

// Submit RIDS to email
POST /api/rids/[id]/submit
Body: { email: string, cc?: string[] }
Returns: { success: boolean, email_sent: boolean }
```

### **RIDS Section Endpoints**

```typescript
// Update personnel information
PUT /api/rids/[id]/personnel-info
Body: { rank, afpsn, unit_organization, ... }

// Update personal information
PUT /api/rids/[id]/personal-info
Body: { employment, residential, personal_details, ... }

// Add promotion record
POST /api/rids/[id]/promotion-history
Body: { rank, date_of_rank, authority, action_type }

// Add training record
POST /api/rids/[id]/military-training
Body: { training_name, school, date_graduated, ... }

// Add award
POST /api/rids/[id]/awards
Body: { award_name, authority, date_awarded, ... }

// Add dependent
POST /api/rids/[id]/dependents
Body: { relation, full_name, birthdate, ... }

// Add education record
POST /api/rids/[id]/education
Body: { course, school, date_graduated, level }

// Add active duty record
POST /api/rids/[id]/active-duty
Body: { unit, purpose, date_start, date_end, efficiency_report }

// Upload biometric files (Supabase Storage)
POST /api/rids/[id]/biometrics
FormData: { photo: File, thumbmark: File, signature: File }
Returns: { photo_url, thumbmark_url, signature_url }
```

### **Implementation Example (Next.js 15):**

```typescript
// src/app/api/rids/[id]/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  // RLS automatically enforces access control
  const { data: rids, error } = await supabase
    .from('rids_records')
    .select(`
      *,
      promotion_history:rids_promotion_history(*),
      trainings:rids_military_training(*),
      awards:rids_awards(*),
      dependents:rids_dependents(*),
      education:rids_education(*),
      active_duty:rids_active_duty(*),
      unit_assignments:rids_unit_assignments(*),
      designations:rids_designations(*)
    `)
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(rids);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('rids_records')
    .update({
      ...body,
      last_updated: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
```

### **Supabase Storage for Biometric Files:**

```typescript
// Upload biometric file example
async function uploadBiometric(
  ridsId: string,
  file: File,
  type: 'photo' | 'thumbmark' | 'signature'
) {
  const supabase = await createClient();

  // Upload to Supabase Storage
  const fileName = `${ridsId}-${type}-${Date.now()}.${file.name.split('.').pop()}`;
  const { data, error } = await supabase.storage
    .from('rids-biometrics')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL (or signed URL for private buckets)
  const { data: { publicUrl } } = supabase.storage
    .from('rids-biometrics')
    .getPublicUrl(fileName);

  // Update RIDS record
  await supabase
    .from('rids_records')
    .update({ [`${type}_url`]: publicUrl })
    .eq('id', ridsId);

  return publicUrl;
}
```

---

## **TESTING CHECKLIST**

### **Functional Testing**

- [ ] Create complete RIDS with all sections
- [ ] Validate all required fields
- [ ] Upload biometric files (photo, thumbmark, signature)
- [ ] Submit RIDS for verification
- [ ] Approve RIDS (Admin workflow)
- [ ] Reject RIDS with feedback
- [ ] Update RIDS (Staff)
- [ ] Limited update by Reservist (Mobile)
- [ ] Export RIDS as PDF
- [ ] Search and filter RIDS
- [ ] Delete RIDS (soft delete with audit trail)

### **Data Integrity Testing**

- [ ] Unique AFPSN validation
- [ ] Date format validation
- [ ] Promotion history chronological order
- [ ] Active duty days calculation accuracy
- [ ] Total commissioned service calculation
- [ ] Age auto-calculation from birthdate
- [ ] Current assignment/designation flagging

### **Integration Testing**

- [ ] RIDS data flows to EO 212 promotion algorithm
- [ ] Training records sync with Training Management module
- [ ] Document management integration
- [ ] Email submission to arescom.rmis@gmail.com
- [ ] Notification system triggers

### **Security Testing**

- [ ] PII encryption
- [ ] Role-based access control enforcement
- [ ] Biometric file security
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Audit logging completeness

---

## **IMPLEMENTATION PRIORITY**

### **Phase 1: Core RIDS Functionality**
1. Database schema implementation
2. Create RIDS form (Web - Staff)
3. Basic validation
4. File upload (biometrics)
5. View RIDS

### **Phase 2: Workflow & Verification**
1. Submit for verification workflow
2. Admin verification interface
3. Approve/Reject functionality
4. Email submission integration
5. Status tracking

### **Phase 3: Mobile & Self-Service**
1. View RIDS (Mobile - Reservist)
2. Limited update capability
3. Notification system
4. PDF export/download

### **Phase 4: Advanced Features**
1. RIDS analytics dashboard
2. Bulk operations
3. Version control
4. Integration with EO 212 algorithm
5. Automated alerts

---

## **SUMMARY**

The RIDS (Reservist Information Data Sheet) is the **master record** for each reservist in the system. It contains:

✅ **12 comprehensive sections** covering all aspects of reservist service  
✅ **Integration points with EO 212** promotion algorithm  
✅ **Biometric verification** (photo, thumbmark, signature)  
✅ **Multi-level approval workflow** (Reservist → Staff → Admin)  
✅ **Official submission** to arescom.rmis@gmail.com  
✅ **Complete audit trail** for accountability  
✅ **Mobile and web access** with role-based permissions  

This forms the foundation of your reservist management system and feeds data into all other modules (training, promotion, documents, etc.).

---

**Document Version:** 2.0
**Last Updated:** October 2025
**Based on:** Philippine Army RIDS Form (s2019)
**For:** Centralize Reservist Management System - 301st Community Defense Center
**Technology Stack:** Next.js 15 + Supabase PostgreSQL (updated from MongoDB)
