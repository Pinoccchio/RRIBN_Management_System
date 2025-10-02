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

### **Complete MongoDB Schema**

```javascript
const RIDSSchema = {
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

## **API ENDPOINTS FOR RIDS**

### **RIDS Management Endpoints**

```
POST   /api/rids/create          - Create new RIDS
GET    /api/rids/:rids_id        - Get RIDS by ID
PUT    /api/rids/:rids_id        - Update RIDS
DELETE /api/rids/:rids_id        - Delete RIDS (soft delete)
GET    /api/rids/search          - Search RIDS with filters
GET    /api/rids/company/:company - Get all RIDS by company
POST   /api/rids/:rids_id/verify - Verify RIDS (Admin)
POST   /api/rids/:rids_id/reject - Reject RIDS with notes
GET    /api/rids/:rids_id/pdf    - Export RIDS as PDF
POST   /api/rids/bulk-export     - Export multiple RIDS
GET    /api/rids/pending         - Get pending verifications
POST   /api/rids/:rids_id/submit - Submit RIDS to email
```

### **RIDS Section Endpoints**

```
PUT /api/rids/:rids_id/personnel-info      - Update section 1
PUT /api/rids/:rids_id/personal-info       - Update section 2
POST /api/rids/:rids_id/promotion-history  - Add promotion record
POST /api/rids/:rids_id/military-training  - Add training record
POST /api/rids/:rids_id/awards             - Add award record
POST /api/rids/:rids_id/dependents         - Add dependent
POST /api/rids/:rids_id/education          - Add education record
POST /api/rids/:rids_id/active-duty        - Add active duty record
POST /api/rids/:rids_id/biometrics         - Upload biometric files
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

**Document Version:** 1.0  
**Last Updated:** March 2025  
**Based on:** Philippine Army RIDS Form (s2019)  
**For:** Centralize Reservist Management System - 301st Community Defense Center
