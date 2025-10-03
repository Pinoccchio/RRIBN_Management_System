# Executive Order No. 212 (1939) Implementation Guide
## Promotion Algorithm for Prescriptive Analytics System

---

## **DOCUMENT OVERVIEW**

**Title:** Executive Order No. 212  
**Date Issued:** July 6, 1939  
**Issued By:** President Manuel L. Quezon  
**Subject:** Regulations Governing Seniority, Promotion, and Separation from the Service, of Officers of the Reserve Force, Philippine Army

**Purpose:** This document establishes the official rules and requirements for promotion eligibility of reserve officers in the Philippine Army Reserve Force.

---

## **I. SENIORITY RULES**

### **Key Principles:**

1. **Precedence**
   - Regular officers take precedence over reserve officers of the same grade
   
2. **Seniority List Management**
   - All Reserve Force officers are carried on an official seniority list
   - List must be approved by the President
   - Establishes permanent relative seniority of officers
   - Officers promoted to a new grade are placed at the bottom of that grade
   - Seniority within a grade is based on **total length of active service**

3. **Loss of Seniority**
   - Officers may lose seniority due to court-martial sentences

4. **List Updates**
   - Chief of Staff maintains the seniority list
   - Updates made for: separations, appointments, loss of rank, and other changes
   - Published to the Army at least **once per year**

---

## **II. PROMOTION REQUIREMENTS**

### **Basic Requirements (All 5 Must Be Fulfilled)**

According to Section 4 of EO 212, every recommendation for promotion must show that **ALL FIVE** of the following conditions are met:

#### **(a) Certificate of Capacity**
- Must hold a certificate of capacity for the next higher grade
- Indicates satisfactory completion of specified correspondence courses
- Courses prescribed by the Chief of Staff

**System Implementation:**
- Database field: `certificate_of_capacity` (Boolean)
- Validation: Check if reservist has completed required correspondence courses
- Status: PASS/FAIL

---

#### **(b) Appropriate Vacancy**
- Must be an appropriate vacancy under the peacetime procurement objective
- Vacancy must exist for the target promotion rank

**System Implementation:**
- Database field: `vacancy_available` (Boolean)
- Check against organizational structure and authorized positions
- Real-time vacancy tracking by rank and company
- Status: AVAILABLE/NOT AVAILABLE

---

#### **(c) Minimum Time in Grade**

**Required Service Time by Rank:**

| Current Rank | Minimum Years in Grade | Next Rank |
|--------------|------------------------|-----------|
| Third Lieutenant | 2 years | Second Lieutenant |
| Second Lieutenant | 3 years | First Lieutenant |
| First Lieutenant | 4 years | Captain |
| Captain | 5 years | Major |
| Major | 6 years | Lieutenant Colonel |
| Lieutenant Colonel | 7 years | Colonel |

**Important Notes:**
- Service time in Officers' Reserve Corps (United States Army) counts
- Service time in Philippine Constabulary counts
- Service time in Philippine Army counts
- All commissioned service is credited when computing length of service

**System Implementation:**
- Database fields:
  - `current_rank` (String)
  - `date_of_rank` (Date)
  - `years_in_grade` (Calculated field)
  - `commissioned_service_history` (Array of service records)
- Calculation:
  ```
  years_in_grade = (current_date - date_of_rank) / 365.25
  total_service = sum(all_commissioned_service)
  ```
- Status: QUALIFIED/NOT QUALIFIED
- Display: "X years of Y years required"

---

#### **(d) Educational Courses**
- Must have completed prescribed correspondence or other educational courses
- Courses prescribed by Chief of Staff for their arm/service and grade
- Courses are specific to the officer's branch and target rank

**System Implementation:**
- Database field: `educational_courses_completed` (Array)
- Required courses by rank and branch
- Track completion dates and certificates
- Status: COMPLETED/INCOMPLETE

---

#### **(e) Active Duty Training & Efficiency Report**
- Must have completed at least **21 days of active duty training** during service in current grade
- Must have received an efficiency report (P.A. Form No. 13A)
- Efficiency rating must be at least **"Satisfactory"**

**Special Provisions:**
- Reserve officers called to extended active duty (6 months or more) are promoted like Regular Army officers
- Still subject to minimum time in grade requirements (section 4c)

**System Implementation:**
- Database fields:
  - `active_duty_days` (Integer)
  - `efficiency_rating` (String: "Excellent", "Satisfactory", "Unsatisfactory")
  - `efficiency_report_form` (Document reference)
- Validation:
  - active_duty_days >= 21
  - efficiency_rating >= "Satisfactory"
- Status: QUALIFIED/NOT QUALIFIED

---

## **III. PROMOTION ALGORITHM LOGIC**

### **Algorithm Flowchart**

```
START PROMOTION EVALUATION
│
├─ INPUT: Reservist Record
│
├─ CHECK CRITERION (a): Certificate of Capacity
│   ├─ IF certificate_of_capacity = TRUE
│   │   └─ Score_A = 20 points
│   └─ ELSE
│       └─ Score_A = 0 points
│
├─ CHECK CRITERION (b): Vacancy Available
│   ├─ IF vacancy_available = TRUE
│   │   └─ Score_B = 20 points
│   └─ ELSE
│       └─ Score_B = 0 points
│
├─ CHECK CRITERION (c): Time in Grade
│   ├─ Calculate: years_in_grade = (current_date - date_of_rank) / 365.25
│   ├─ Get: required_years = MINIMUM_YEARS[current_rank]
│   ├─ IF years_in_grade >= required_years
│   │   └─ Score_C = 20 points
│   └─ ELSE
│       └─ Score_C = 0 points
│
├─ CHECK CRITERION (d): Educational Courses
│   ├─ IF all_required_courses_completed = TRUE
│   │   └─ Score_D = 20 points
│   └─ ELSE
│       └─ Score_D = 0 points
│
├─ CHECK CRITERION (e): Active Duty & Efficiency
│   ├─ IF (active_duty_days >= 21) AND (efficiency_rating >= "Satisfactory")
│   │   └─ Score_E = 20 points
│   └─ ELSE
│       └─ Score_E = 0 points
│
├─ CALCULATE TOTAL SCORE
│   └─ Total_Score = Score_A + Score_B + Score_C + Score_D + Score_E
│   └─ Total_Score = (Total / 100) * 100%
│
├─ DETERMINE ELIGIBILITY
│   ├─ IF Total_Score = 100 (all criteria met)
│   │   └─ Status = "ELIGIBLE FOR PROMOTION"
│   ├─ ELSE IF Total_Score >= 60
│   │   └─ Status = "PARTIALLY QUALIFIED" (for tracking/development)
│   └─ ELSE
│       └─ Status = "NOT ELIGIBLE"
│
├─ GENERATE RECOMMENDATION
│   ├─ IF Status = "ELIGIBLE FOR PROMOTION"
│   │   └─ Add to promotion recommendation list
│   │   └─ Calculate priority score (based on seniority, performance)
│   └─ ELSE
│       └─ Generate development plan (identify missing criteria)
│
└─ OUTPUT: Promotion Assessment Report
    ├─ Eligibility Status
    ├─ Scores by Criterion
    ├─ Missing Requirements
    └─ Recommended Actions
```

---

## **IV. DATABASE SCHEMA REQUIREMENTS**

### **🔴 CURRENT SYSTEM: SUPABASE POSTGRESQL 🔴**

> **Updated October 2025 - Next.js 15 + Supabase Architecture**

The system uses **Supabase PostgreSQL** with Row-Level Security (RLS), NOT MongoDB. Promotion data integrates with existing tables and new promotion-specific tables.

### **Primary Database Schema: Supabase PostgreSQL** ✅

> **THIS IS THE ACTIVE SCHEMA - Use this for all development**

```sql
-- Extension to reservist_details for promotion tracking
ALTER TABLE public.reservist_details
ADD COLUMN IF NOT EXISTS current_rank_date DATE,
ADD COLUMN IF NOT EXISTS years_in_grade NUMERIC GENERATED ALWAYS AS (
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, current_rank_date))
  + EXTRACT(MONTH FROM AGE(CURRENT_DATE, current_rank_date)) / 12.0
) STORED;

-- Promotion Eligibility Tracking
CREATE TABLE IF NOT EXISTS public.promotion_eligibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservist_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  assessment_date TIMESTAMPTZ DEFAULT now(),
  current_rank TEXT NOT NULL,
  target_rank TEXT NOT NULL,

  -- Criterion (a): Certificate of Capacity
  has_certificate BOOLEAN DEFAULT false,
  certificate_details JSONB, -- { target_rank, courses_completed: [...] }

  -- Criterion (b): Vacancy
  is_vacancy_available BOOLEAN DEFAULT false,
  vacancy_details JSONB, -- { target_position, vacancy_id, last_checked }

  -- Criterion (c): Time in Grade (from EO 212)
  years_in_grade NUMERIC,
  required_years NUMERIC,
  time_in_grade_met BOOLEAN DEFAULT false,

  -- Criterion (d): Educational Courses
  required_courses JSONB, -- Array of required courses
  completed_courses JSONB, -- Array of completed courses
  education_requirement_met BOOLEAN DEFAULT false,

  -- Criterion (e): Active Duty Training & Efficiency
  total_active_duty_days INTEGER DEFAULT 0,
  current_efficiency_rating TEXT CHECK (current_efficiency_rating IN ('Excellent', 'Satisfactory', 'Unsatisfactory')),
  active_duty_requirement_met BOOLEAN DEFAULT false,

  -- Scoring
  certificate_score INTEGER DEFAULT 0 CHECK (certificate_score IN (0, 20)),
  vacancy_score INTEGER DEFAULT 0 CHECK (vacancy_score IN (0, 20)),
  time_in_grade_score INTEGER DEFAULT 0 CHECK (time_in_grade_score IN (0, 20)),
  education_score INTEGER DEFAULT 0 CHECK (education_score IN (0, 20)),
  active_duty_score INTEGER DEFAULT 0 CHECK (active_duty_score IN (0, 20)),
  total_score INTEGER GENERATED ALWAYS AS (
    certificate_score + vacancy_score + time_in_grade_score + education_score + active_duty_score
  ) STORED,
  percentage NUMERIC GENERATED ALWAYS AS (total_score::NUMERIC) STORED,

  -- Eligibility Status
  eligibility_status TEXT GENERATED ALWAYS AS (
    CASE
      WHEN total_score = 100 THEN 'ELIGIBLE'
      WHEN total_score >= 60 THEN 'PARTIALLY QUALIFIED'
      ELSE 'NOT ELIGIBLE'
    END
  ) STORED,
  is_eligible BOOLEAN GENERATED ALWAYS AS (total_score = 100) STORED,

  -- Recommendations
  is_recommended_for_promotion BOOLEAN DEFAULT false,
  priority_score NUMERIC,
  rank_in_promotion_list INTEGER,
  recommended_actions TEXT[],
  development_plan JSONB, -- Array of { requirement, status, action, completion_date }

  -- Seniority
  position_in_grade INTEGER,
  total_commissioned_service NUMERIC,
  seniority_date DATE,

  -- Metadata
  assessed_by UUID REFERENCES public.accounts(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_assessment UNIQUE (reservist_id, assessment_date)
);

-- Indexes
CREATE INDEX idx_promotion_reservist ON promotion_eligibility(reservist_id);
CREATE INDEX idx_promotion_status ON promotion_eligibility(eligibility_status);
CREATE INDEX idx_promotion_eligible ON promotion_eligibility(is_eligible) WHERE is_eligible = true;

-- Enable RLS
ALTER TABLE public.promotion_eligibility ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "promotion_eligibility_select" ON public.promotion_eligibility
  FOR SELECT USING (
    -- Super admin sees all
    (auth.jwt() ->> 'role')::text = 'super_admin'
    -- Reservists see their own
    OR reservist_id = auth.uid()
  );

-- Commissioned Service History (for total service calculation)
CREATE TABLE IF NOT EXISTS public.commissioned_service_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservist_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  organization TEXT NOT NULL, -- 'Philippine Army', 'US Army Reserve Corps', 'Philippine Constabulary'
  start_date DATE NOT NULL,
  end_date DATE,
  rank_held TEXT NOT NULL,
  total_years NUMERIC GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM AGE(COALESCE(end_date, CURRENT_DATE), start_date))
    + EXTRACT(MONTH FROM AGE(COALESCE(end_date, CURRENT_DATE), start_date)) / 12.0
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Training Courses (for criterion d)
CREATE TABLE IF NOT EXISTS public.training_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id TEXT UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  arm_service TEXT, -- Infantry, Artillery, etc.
  grade_level TEXT, -- Rank level this course is for
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Course Completion Records
CREATE TABLE IF NOT EXISTS public.course_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservist_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.training_courses(course_id),
  completion_date DATE NOT NULL,
  certificate_number TEXT,
  prescribed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_course_completion UNIQUE (reservist_id, course_id)
);

-- Active Duty Training Records (for criterion e)
CREATE TABLE IF NOT EXISTS public.active_duty_training (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservist_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  training_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_completed INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  location TEXT,
  efficiency_report JSONB, -- { report_form: 'P.A. Form No. 13A', rating, evaluator, period_covered }
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Efficiency Ratings (for criterion e)
CREATE TABLE IF NOT EXISTS public.efficiency_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservist_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  report_form TEXT DEFAULT 'P.A. Form No. 13A',
  report_date DATE NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('Excellent', 'Satisfactory', 'Unsatisfactory')),
  evaluator TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vacancy Tracking (for criterion b)
CREATE TABLE IF NOT EXISTS public.promotion_vacancies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vacancy_id TEXT UNIQUE NOT NULL,
  rank TEXT NOT NULL,
  company TEXT REFERENCES public.companies(code),
  position_title TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_date DATE DEFAULT CURRENT_DATE,
  filled_date DATE,
  filled_by UUID REFERENCES public.accounts(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assessment History
CREATE TABLE IF NOT EXISTS public.promotion_assessment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservist_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.promotion_eligibility(id),
  assessment_date TIMESTAMPTZ NOT NULL,
  total_score INTEGER NOT NULL,
  eligibility_status TEXT NOT NULL,
  assessed_by UUID REFERENCES public.accounts(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

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
> - **Storage**: Supabase Storage (NOT local filesystem)
>
> **For all new development, use the Supabase PostgreSQL schema defined above.**

```javascript
// ⚠️ WARNING: This is the OLD MongoDB schema - NOT USED in current system
// Current system uses Supabase PostgreSQL (see SQL schema above)
// Last updated: Pre-October 2025 (deprecated)
ReservistPromotionProfile_LEGACY = {
  // Basic Information
  service_id: String,
  full_name: String,
  current_rank: String,
  company: String,
  
  // Criterion (a): Certificate of Capacity
  certificate_of_capacity: {
    has_certificate: Boolean,
    target_rank: String,
    courses_completed: [
      {
        course_name: String,
        completion_date: Date,
        certificate_number: String
      }
    ],
    status: String // "Completed", "In Progress", "Not Started"
  },
  
  // Criterion (b): Vacancy
  vacancy_status: {
    is_vacancy_available: Boolean,
    target_position: String,
    vacancy_id: String,
    last_checked: Date
  },
  
  // Criterion (c): Time in Grade
  rank_history: [
    {
      rank: String,
      date_appointed: Date,
      date_promoted: Date,
      years_served: Number
    }
  ],
  current_rank_details: {
    rank: String,
    date_of_rank: Date,
    years_in_grade: Number, // Calculated
    required_years: Number,
    is_qualified: Boolean
  },
  commissioned_service_history: [
    {
      organization: String, // "Philippine Army", "US Army Reserve Corps", "Philippine Constabulary"
      start_date: Date,
      end_date: Date,
      rank_held: String,
      total_years: Number
    }
  ],
  
  // Criterion (d): Educational Courses
  educational_requirements: {
    required_courses: [
      {
        course_id: String,
        course_name: String,
        arm_service: String,
        grade_level: String,
        required: Boolean
      }
    ],
    completed_courses: [
      {
        course_id: String,
        completion_date: Date,
        certificate_number: String,
        prescribed_by: String
      }
    ],
    completion_percentage: Number,
    is_qualified: Boolean
  },
  
  // Criterion (e): Active Duty Training & Efficiency
  active_duty_records: {
    total_active_duty_days: Number,
    training_sessions: [
      {
        training_name: String,
        start_date: Date,
        end_date: Date,
        days_completed: Number,
        location: String
      }
    ],
    efficiency_reports: [
      {
        report_form: String, // "P.A. Form No. 13A"
        report_date: Date,
        rating: String, // "Excellent", "Satisfactory", "Unsatisfactory"
        evaluator: String,
        period_covered: {
          start: Date,
          end: Date
        }
      }
    ],
    current_efficiency_rating: String,
    meets_requirement: Boolean // >= 21 days AND >= "Satisfactory"
  },
  
  // Promotion Eligibility Assessment
  promotion_assessment: {
    assessment_date: Date,
    target_rank: String,
    
    scores: {
      certificate_score: Number, // 0 or 20
      vacancy_score: Number,     // 0 or 20
      time_in_grade_score: Number, // 0 or 20
      education_score: Number,   // 0 or 20
      active_duty_score: Number, // 0 or 20
      total_score: Number,       // 0 to 100
      percentage: Number         // Total as percentage
    },
    
    eligibility_status: String, // "ELIGIBLE", "PARTIALLY QUALIFIED", "NOT ELIGIBLE"
    
    criteria_status: {
      certificate_met: Boolean,
      vacancy_met: Boolean,
      time_in_grade_met: Boolean,
      education_met: Boolean,
      active_duty_met: Boolean
    },
    
    missing_requirements: [String],
    
    recommendations: {
      is_recommended_for_promotion: Boolean,
      priority_score: Number, // Based on seniority, performance, etc.
      rank_in_promotion_list: Number,
      recommended_actions: [String],
      development_plan: [
        {
          requirement: String,
          current_status: String,
          action_needed: String,
          estimated_completion: Date
        }
      ]
    }
  },
  
  // Seniority Information
  seniority_data: {
    position_in_grade: Number,
    total_commissioned_service: Number,
    seniority_date: Date,
    can_lose_seniority: Boolean,
    seniority_notes: String
  },
  
  // Audit Trail
  assessment_history: [
    {
      assessment_id: String,
      assessment_date: Date,
      total_score: Number,
      eligibility_status: String,
      assessed_by: String
    }
  ],
  
  last_updated: Date,
  updated_by: String
}
```

---

## **V. PRESCRIPTIVE ANALYTICS FEATURES**

### **1. Automatic Eligibility Checking**

**Function:** `checkPromotionEligibility(reservist_id)`

**Process:**
1. Retrieve reservist record from database
2. Evaluate each of the 5 criteria
3. Calculate scores (0 or 20 points each)
4. Calculate total score (0-100)
5. Determine eligibility status
6. Identify missing requirements
7. Generate recommendations
8. Store assessment results
9. Return eligibility report

**Output:**
```json
{
  "reservist_id": "AFP-2024-12345",
  "name": "Juan Dela Cruz",
  "current_rank": "First Lieutenant",
  "target_rank": "Captain",
  "assessment_date": "2025-03-15",
  "total_score": 80,
  "eligibility_status": "PARTIALLY QUALIFIED",
  "criteria_results": {
    "certificate_of_capacity": { "met": true, "score": 20 },
    "vacancy_available": { "met": true, "score": 20 },
    "time_in_grade": { "met": true, "score": 20 },
    "educational_courses": { "met": true, "score": 20 },
    "active_duty_training": { "met": false, "score": 0 }
  },
  "missing_requirements": [
    "Complete 21 days active duty training (currently: 15 days)",
    "Obtain efficiency report with 'Satisfactory' rating"
  ],
  "recommendations": [
    "Schedule for upcoming training session in April 2025",
    "Estimated eligibility date: June 2025"
  ]
}
```

---

### **2. Promotion Recommendation Engine**

**Function:** `generatePromotionRecommendations(company_id, rank)`

**Process:**
1. Query all reservists in specified company and rank
2. Run eligibility check for each reservist
3. Filter for eligible candidates (100% score)
4. Rank candidates by:
   - Seniority (years of service)
   - Efficiency ratings
   - Training completion
   - Service history
5. Generate prioritized recommendation list
6. Output report for administrator review

**Output:**
```json
{
  "company": "Alpha",
  "target_rank": "Captain",
  "eligible_candidates": 5,
  "recommendation_list": [
    {
      "rank": 1,
      "service_id": "AFP-2020-11111",
      "name": "Juan Dela Cruz",
      "current_rank": "First Lieutenant",
      "years_in_grade": 4.5,
      "total_score": 100,
      "efficiency_rating": "Excellent",
      "recommendation": "HIGHLY RECOMMENDED"
    },
    {
      "rank": 2,
      "service_id": "AFP-2020-22222",
      "name": "Pedro Santos",
      "current_rank": "First Lieutenant",
      "years_in_grade": 4.2,
      "total_score": 100,
      "efficiency_rating": "Satisfactory",
      "recommendation": "RECOMMENDED"
    }
  ],
  "partially_qualified": 8,
  "not_eligible": 12
}
```

---

### **3. Development Gap Analysis**

**Function:** `analyzePromotionGaps(reservist_id)`

**Process:**
1. Identify which of the 5 criteria are not met
2. Calculate gap for each requirement
3. Estimate time needed to fulfill each requirement
4. Generate personalized development plan
5. Set target eligibility date

**Output:**
```json
{
  "reservist_id": "AFP-2024-12345",
  "name": "Juan Dela Cruz",
  "current_rank": "First Lieutenant",
  "target_rank": "Captain",
  "current_eligibility_score": 60,
  "gaps_identified": [
    {
      "criterion": "Time in Grade",
      "requirement": "4 years",
      "current_status": "3.2 years",
      "gap": "0.8 years (9.6 months)",
      "estimated_fulfillment_date": "2025-12-15",
      "action_required": "Continue active service"
    },
    {
      "criterion": "Active Duty Training",
      "requirement": "21 days with Satisfactory rating",
      "current_status": "15 days completed",
      "gap": "6 days",
      "estimated_fulfillment_date": "2025-06-30",
      "action_required": "Enroll in next available training session"
    }
  ],
  "development_plan": [
    {
      "action": "Complete 6 additional days of active duty training",
      "deadline": "2025-06-30",
      "priority": "HIGH"
    },
    {
      "action": "Obtain efficiency report rating",
      "deadline": "2025-07-15",
      "priority": "HIGH"
    }
  ],
  "estimated_eligibility_date": "2026-01-01"
}
```

---

### **4. Company-Wide Promotion Dashboard**

**Features:**
- Total eligible reservists by rank
- Upcoming promotion eligibility (within 6 months)
- Training completion rates
- Vacancy availability by rank
- Promotion readiness heatmap

---

### **5. Alerts & Notifications**

**Automated Alerts:**
1. **Eligibility Achievement Alert**
   - Trigger: When reservist meets all 5 criteria
   - Recipient: Reservist, Staff, Administrator
   - Message: "Congratulations! You are now eligible for promotion to [RANK]"

2. **Approaching Eligibility Alert**
   - Trigger: When reservist is 90 days from meeting time-in-grade requirement
   - Recipient: Reservist
   - Message: "You will be eligible for promotion consideration in 90 days. Ensure all other requirements are met."

3. **Missing Requirement Alert**
   - Trigger: When training deadline approaches or document expires
   - Recipient: Reservist
   - Message: "Action Required: Complete [REQUIREMENT] by [DATE] to maintain promotion eligibility"

4. **Vacancy Available Alert**
   - Trigger: When a promotion vacancy opens in reservist's company
   - Recipient: Eligible reservists
   - Message: "Promotion opportunity available: [RANK] position in [COMPANY]"

---

## **VI. SYSTEM IMPLEMENTATION CHECKLIST**

### **Phase 1: Database Setup**
- [ ] Create ReservistPromotionProfile schema
- [ ] Set up rank hierarchy and time requirements
- [ ] Define educational course catalog
- [ ] Create efficiency rating system
- [ ] Set up vacancy tracking system

### **Phase 2: Core Algorithm Development**
- [ ] Build eligibility checking function
- [ ] Implement 5-criteria scoring system
- [ ] Create weighted promotion ranking algorithm
- [ ] Develop gap analysis module
- [ ] Build development plan generator

### **Phase 3: Dashboard & Reporting**
- [ ] Design Super Admin analytics dashboard
- [ ] Create company-level promotion reports
- [ ] Build individual reservist eligibility cards
- [ ] Implement promotion timeline visualizations

### **Phase 4: Automation & Notifications**
- [ ] Set up automated eligibility checks (daily/weekly)
- [ ] Configure notification triggers
- [ ] Implement email/push notification system
- [ ] Create scheduled report generation

### **Phase 5: Testing & Validation**
- [ ] Test with historical promotion data
- [ ] Validate against actual EO 212 requirements
- [ ] Subject matter expert review (military personnel)
- [ ] Achieve 80% accuracy requirement
- [ ] User acceptance testing

---

## **VII. CALCULATION FORMULAS**

### **Time in Grade Calculation**
```javascript
function calculateYearsInGrade(date_of_rank) {
  const current_date = new Date();
  const rank_date = new Date(date_of_rank);
  const milliseconds_diff = current_date - rank_date;
  const years = milliseconds_diff / (1000 * 60 * 60 * 24 * 365.25);
  return years.toFixed(2);
}
```

### **Total Commissioned Service Calculation**
```javascript
function calculateTotalCommissionedService(service_history) {
  let total_years = 0;
  
  service_history.forEach(service => {
    const start = new Date(service.start_date);
    const end = service.end_date ? new Date(service.end_date) : new Date();
    const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
    total_years += years;
  });
  
  return total_years.toFixed(2);
}
```

### **Eligibility Score Calculation (Supabase)**

```typescript
// Server-side function using Supabase
import { createClient } from '@/lib/supabase/server';

async function calculateEligibilityScore(reservistId: string) {
  const supabase = await createClient();

  // Fetch reservist data
  const { data: reservist, error } = await supabase
    .from('reservist_details')
    .select(`
      *,
      accounts!inner(id, email),
      course_completions(*, training_courses(*)),
      active_duty_training(*),
      efficiency_ratings(*),
      commissioned_service_history(*)
    `)
    .eq('id', reservistId)
    .single();

  if (error || !reservist) {
    throw new Error('Reservist not found');
  }

  let scores = {
    certificate_score: 0,
    vacancy_score: 0,
    time_in_grade_score: 0,
    education_score: 0,
    active_duty_score: 0,
  };

  // Criterion (a): Certificate of Capacity - 20 points
  const hasCertificate = await checkCertificateOfCapacity(reservist);
  if (hasCertificate) {
    scores.certificate_score = 20;
  }

  // Criterion (b): Vacancy Available - 20 points
  const { data: vacancy } = await supabase
    .from('promotion_vacancies')
    .select('*')
    .eq('rank', reservist.target_rank)
    .eq('is_available', true)
    .maybeSingle();

  if (vacancy) {
    scores.vacancy_score = 20;
  }

  // Criterion (c): Time in Grade - 20 points
  const requiredYears = RANK_REQUIREMENTS[reservist.rank]?.required_years || 0;
  if (reservist.years_in_grade >= requiredYears) {
    scores.time_in_grade_score = 20;
  }

  // Criterion (d): Educational Courses - 20 points
  const hasRequiredCourses = await checkRequiredCourses(reservist);
  if (hasRequiredCourses) {
    scores.education_score = 20;
  }

  // Criterion (e): Active Duty & Efficiency - 20 points
  const totalActiveDutyDays = reservist.active_duty_training
    ?.reduce((sum: number, adt: any) => sum + adt.days_completed, 0) || 0;

  const latestEfficiency = reservist.efficiency_ratings?.[0];
  const hasSatisfactoryRating = latestEfficiency?.rating !== 'Unsatisfactory';

  if (totalActiveDutyDays >= 21 && hasSatisfactoryRating) {
    scores.active_duty_score = 20;
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  // Insert/update promotion_eligibility table
  await supabase.from('promotion_eligibility').upsert({
    reservist_id: reservistId,
    assessment_date: new Date().toISOString(),
    current_rank: reservist.rank,
    target_rank: getNextRank(reservist.rank),
    ...scores,
  });

  return {
    scores,
    total_score: totalScore,
    percentage: totalScore,
    is_eligible: totalScore === 100,
    eligibility_status: totalScore === 100 ? 'ELIGIBLE' :
                       totalScore >= 60 ? 'PARTIALLY QUALIFIED' :
                       'NOT ELIGIBLE',
  };
}

// Helper function
function getNextRank(currentRank: string): string {
  const rankProgression: Record<string, string> = {
    'Third Lieutenant': 'Second Lieutenant',
    'Second Lieutenant': 'First Lieutenant',
    'First Lieutenant': 'Captain',
    'Captain': 'Major',
    'Major': 'Lieutenant Colonel',
    'Lieutenant Colonel': 'Colonel',
  };
  return rankProgression[currentRank] || currentRank;
}
```

### **Promotion Priority Ranking**
```javascript
function calculatePriorityScore(reservist) {
  let priority = 0;
  
  // Factor 1: Years of total service (40% weight)
  priority += (reservist.seniority_data.total_commissioned_service * 4);
  
  // Factor 2: Efficiency rating (30% weight)
  const efficiency_scores = {
    "Excellent": 30,
    "Satisfactory": 20,
    "Unsatisfactory": 0
  };
  priority += efficiency_scores[reservist.active_duty_records.current_efficiency_rating];
  
  // Factor 3: Training completion rate (20% weight)
  priority += (reservist.educational_requirements.completion_percentage * 0.2);
  
  // Factor 4: Active duty days above minimum (10% weight)
  const extra_days = Math.max(0, reservist.active_duty_records.total_active_duty_days - 21);
  priority += (extra_days * 0.5);
  
  return Math.round(priority);
}
```

---

## **VIII. REFERENCE DATA**

### **Rank Progression Table**
```javascript
const RANK_REQUIREMENTS = {
  "Third Lieutenant": {
    next_rank: "Second Lieutenant",
    required_years: 2,
    education_courses: ["Basic Officer Course"],
    min_active_duty_days: 21
  },
  "Second Lieutenant": {
    next_rank: "First Lieutenant",
    required_years: 3,
    education_courses: ["Intermediate Officer Course"],
    min_active_duty_days: 21
  },
  "First Lieutenant": {
    next_rank: "Captain",
    required_years: 4,
    education_courses: ["Advanced Officer Course"],
    min_active_duty_days: 21
  },
  "Captain": {
    next_rank: "Major",
    required_years: 5,
    education_courses: ["Staff Officer Course"],
    min_active_duty_days: 21
  },
  "Major": {
    next_rank: "Lieutenant Colonel",
    required_years: 6,
    education_courses: ["Command and Staff Course"],
    min_active_duty_days: 21
  },
  "Lieutenant Colonel": {
    next_rank: "Colonel",
    required_years: 7,
    education_courses: ["Senior Officer Course"],
    min_active_duty_days: 21
  }
};
```

### **Efficiency Rating Standards**
```javascript
const EFFICIENCY_RATINGS = {
  "Excellent": {
    numeric_value: 95,
    qualifies_for_promotion: true,
    description: "Consistently exceeds all performance standards"
  },
  "Satisfactory": {
    numeric_value: 70,
    qualifies_for_promotion: true,
    description: "Meets all performance standards"
  },
  "Unsatisfactory": {
    numeric_value: 50,
    qualifies_for_promotion: false,
    description: "Does not meet minimum performance standards"
  }
};
```

---

## **IX. API ENDPOINTS FOR PRESCRIPTIVE ANALYTICS (Next.js 15)**

### **🔴 CURRENT IMPLEMENTATION - Updated October 2025 🔴**

> **Technology Stack:**
> - **Framework**: Next.js 15 with App Router
> - **API Pattern**: Route Handlers (`src/app/api/*/route.ts`)
> - **Database**: Supabase PostgreSQL
> - **Auth**: Supabase Auth + Middleware
> - **Authorization**: Row-Level Security (RLS) policies

### **API Route Structure:**
All promotion analytics routes are in: `src/app/api/analytics/promotion/`

### **1. Check Individual Eligibility**

```typescript
// src/app/api/analytics/promotion/check-eligibility/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse request body
  const { reservist_id } = await request.json();

  // Calculate eligibility (uses RLS to enforce access control)
  const eligibilityReport = await calculateEligibilityScore(reservist_id);

  if (!eligibilityReport) {
    return NextResponse.json({ error: 'Reservist not found or access denied' }, { status: 404 });
  }

  return NextResponse.json(eligibilityReport);
}

// Helper function to calculate eligibility
async function calculateEligibilityScore(reservistId: string) {
  const supabase = await createClient();

  // Fetch reservist with all related data (RLS automatically enforced)
  const { data: reservist, error } = await supabase
    .from('reservist_details')
    .select(`
      *,
      accounts!inner(id, email),
      training_registrations!inner(
        *,
        training_sessions(*)
      ),
      course_completions(*),
      active_duty_training(*),
      efficiency_ratings(*),
      commissioned_service_history(*)
    `)
    .eq('id', reservistId)
    .single();

  if (error || !reservist) return null;

  // Calculate scores based on EO 212 criteria
  const scores = {
    certificate_score: 0,
    vacancy_score: 0,
    time_in_grade_score: 0,
    education_score: 0,
    active_duty_score: 0,
  };

  // [... calculation logic ...]

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return {
    reservist_id: reservistId,
    name: `${reservist.accounts.first_name} ${reservist.accounts.last_name}`,
    current_rank: reservist.rank,
    target_rank: getNextRank(reservist.rank),
    total_score: totalScore,
    eligibility_status: totalScore === 100 ? 'ELIGIBLE' : 'NOT ELIGIBLE',
    criteria_results: scores,
    missing_requirements: identifyMissingRequirements(scores),
    recommendations: generateRecommendations(scores),
  };
}

/* Request Example:
POST /api/analytics/promotion/check-eligibility
{
  "reservist_id": "uuid-here"
}
*/
```

### **2. Generate Company Recommendations**

```typescript
// src/app/api/analytics/promotion/recommendations/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Get query parameters
  const { searchParams } = new URL(request.url);
  const company = searchParams.get('company');
  const targetRank = searchParams.get('rank');

  if (!company || !targetRank) {
    return NextResponse.json(
      { error: 'Missing required parameters: company and rank' },
      { status: 400 }
    );
  }

  // Query promotion eligibility (RLS enforced)
  const { data: eligibleCandidates, error } = await supabase
    .from('promotion_eligibility')
    .select(`
      *,
      reservist:reservist_details!inner(
        *,
        accounts!inner(first_name, last_name)
      )
    `)
    .eq('reservist.company', company)
    .eq('target_rank', targetRank)
    .eq('is_eligible', true)
    .order('priority_score', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get partially qualified and not eligible counts
  const { count: partialCount } = await supabase
    .from('promotion_eligibility')
    .select('*', { count: 'exact', head: true })
    .eq('eligibility_status', 'PARTIALLY QUALIFIED');

  const { count: notEligibleCount } = await supabase
    .from('promotion_eligibility')
    .select('*', { count: 'exact', head: true })
    .eq('eligibility_status', 'NOT ELIGIBLE');

  return NextResponse.json({
    company,
    target_rank: targetRank,
    eligible_candidates: eligibleCandidates?.length || 0,
    recommendation_list: eligibleCandidates?.map((candidate, index) => ({
      rank: index + 1,
      service_id: candidate.reservist.service_number,
      name: `${candidate.reservist.accounts.first_name} ${candidate.reservist.accounts.last_name}`,
      current_rank: candidate.current_rank,
      years_in_grade: candidate.years_in_grade,
      total_score: candidate.total_score,
      efficiency_rating: candidate.current_efficiency_rating,
      recommendation: candidate.total_score === 100 ? 'HIGHLY RECOMMENDED' : 'RECOMMENDED',
    })),
    partially_qualified: partialCount || 0,
    not_eligible: notEligibleCount || 0,
  });
}

/* Request Example:
GET /api/analytics/promotion/recommendations?company=ALPHA&rank=Captain
*/
```

### **3. Analyze Promotion Gaps**
```typescript
// GET /api/analytics/promotion/gaps/[id]
GET /api/analytics/promotion/gaps/[reservist_id]
Response: {
  reservist_id: string,
  current_eligibility_score: number,
  gaps_identified: [...],
  development_plan: [...],
  estimated_eligibility_date: string
}
```

### **4. Get Promotion Dashboard Data**
```typescript
// GET /api/analytics/promotion/dashboard
GET /api/analytics/promotion/dashboard?company=ALPHA
Response: {
  total_eligible: number,
  by_rank: {...},
  upcoming_eligibility: [...],
  vacancy_status: {...}
}
```

### **5. Run Batch Eligibility Check**
```typescript
// POST /api/analytics/promotion/batch-check
POST /api/analytics/promotion/batch-check
Body: { company: string, rank: string }
Response: {
  company: string,
  rank: string,
  total_checked: number,
  eligible: number,
  results: [...]
}

// Uses Supabase batch query
```

---

## **X. TESTING & VALIDATION REQUIREMENTS**

### **Accuracy Target: 80% (Per Project Requirements)**

**Testing Methodology:**
1. **Historical Data Validation**
   - Use past 5 years of promotion records
   - Compare algorithm recommendations vs. actual promotions
   - Calculate accuracy percentage

2. **Subject Matter Expert Review**
   - Present algorithm results to military personnel
   - Verify compliance with EO 212
   - Validate ranking logic

3. **Edge Case Testing**
   - Reservists with exactly minimum requirements
   - Reservists with service gaps
   - Reservists with multiple organizations in service history
   - Reservists with court-martial history (seniority loss)

4. **Performance Testing**
   - Test with 5,000+ reservist records
   - Ensure query response time < 2 seconds
   - Batch processing efficiency

---

## **XI. COMPLIANCE & LEGAL CONSIDERATIONS**

### **Key Compliance Points:**
1. All promotion recommendations must strictly follow EO 212
2. All 5 criteria are **mandatory** - no exceptions unless specified in EO 212
3. System must maintain audit trail of all eligibility assessments
4. Manual override capability for administrators (with justification)
5. Regular validation against updated military regulations

### **Documentation Requirements:**
- Maintain records of all promotion assessments
- Document any system overrides or manual adjustments
- Keep audit logs for compliance review
- Generate reports for military leadership review

---

## **XII. FUTURE ENHANCEMENTS**

### **Potential Features:**
1. Machine learning for performance prediction
2. Career path visualization for reservists
3. Training needs forecasting
4. Vacancy prediction modeling
5. Retention risk analysis
6. Succession planning recommendations

---

## **SUMMARY**

This implementation guide provides a complete framework for building the prescriptive analytics promotion algorithm based on Executive Order No. 212 (1939). The system must:

✅ **Evaluate all 5 mandatory criteria**
✅ **Assign equal weight (20 points each)**
✅ **Require 100% score for full eligibility**
✅ **Track partial qualification (60%+) for development**
✅ **Generate actionable recommendations**
✅ **Provide gap analysis and development plans**
✅ **Maintain audit trails and compliance**
✅ **Achieve 80%+ accuracy validated by experts**

The algorithm transforms a manual, paper-based promotion evaluation process into an automated, data-driven system that ensures fair, compliant, and transparent promotion recommendations for the 301st Ready Reserve Infantry Battalion.

---

**Document Version:** 2.0
**Last Updated:** October 2025
**Based on:** Executive Order No. 212 (July 6, 1939)
**For:** Centralize Reservist Management System - 301st Community Defense Center
**Technology Stack:** Next.js 15 + Supabase PostgreSQL (updated from MongoDB/Express.js)
