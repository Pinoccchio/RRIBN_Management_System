Based on the RIDS Implementation Guide, here's a breakdown of the RIDS features for each role:

  ---
  RIDS Features by Role

  1. RESERVIST (Mobile App)

  Read-Only Features:
  - ✅ View My RIDS - See their own RIDS status and all information
  - ✅ Download PDF Copy - Export personal RIDS to PDF
  - ✅ View Verification Status - See if RIDS is draft, submitted, verified, or rejected
  - ✅ View Staff Feedback - Read verification notes or rejection reasons

  Limited Update Features:
  - ✅ Update Contact Information - Change phone/email
  - ✅ Update Residential Address - Update home address
  - ✅ Upload New Photo - Replace 2x2 photo
  - ⚠️ Submit Update Request - Changes require staff approval

  Certification:
  - ✅ Review & Certify RIDS - Sign off on "I HEREBY CERTIFY..." statement

  What Reservists CANNOT Do:
  - ❌ Cannot create new RIDS
  - ❌ Cannot modify military records (rank, training, awards, etc.)
  - ❌ Cannot verify or approve RIDS
  - ❌ Cannot delete RIDS

  ---
  2. STAFF (Web Application)

  Create & Manage:
  - ✅ Create New RIDS - Full multi-step form wizard for creating reservist RIDS
  - ✅ Edit RIDS - Modify all sections (except verified ones)
  - ✅ Auto-Save Drafts - Save work in progress
  - ✅ Upload Biometrics - Photo, thumbmark, signature

  View & Search:
  - ✅ View RIDS (Company Only) - See RIDS for their assigned company
  - ✅ Search Reservists - By name, AFPSN, company
  - ✅ Filter by Status - Draft, Submitted, Verified, Rejected
  - ✅ Version History - Track RIDS changes

  Workflow:
  - ✅ Submit RIDS for Verification - Request admin approval
  - ⚠️ Request Verification - Can request admin to verify, but cannot approve themselves

  Export:
  - ✅ Export PDF - Generate official RIDS PDF
  - ✅ Bulk Export - Export multiple RIDS at once

  What Staff CANNOT Do:
  - ❌ Cannot verify/approve RIDS (admin-only)
  - ❌ Cannot view RIDS from other companies
  - ❌ Cannot permanently delete RIDS

  ---
  3. ADMIN (Web Application)

  Full CRUD Access:
  - ✅ Create New RIDS - Full form wizard
  - ✅ Edit Any RIDS - Modify all RIDS in the system
  - ✅ View All RIDS - Access RIDS from all companies
  - ✅ Search & Filter - System-wide search

  Verification Workflow:
  - ✅ Review Submitted RIDS - Access "Pending Verifications" dashboard
  - ✅ Approve RIDS - Mark as verified with attestation
  - ✅ Reject RIDS - Return with feedback/corrections needed
  - ✅ Add Verification Notes - Document review process
  - ✅ Sign Attestation (Section 12) - Official verification signature

  Document Management:
  - ✅ Review Supporting Documents - Verify uploaded attachments
  - ✅ Request Additional Documents - Ask for missing files

  Analytics:
  - ✅ RIDS Completion Rate by Company - Track progress
  - ✅ Pending Verifications Dashboard - See backlog
  - ✅ Missing Information Reports - Identify incomplete RIDS
  - ✅ Document Expiry Alerts - Track renewals

  Export & Submission:
  - ✅ Export PDF - Official format
  - ✅ Bulk Operations - Export, print multiple RIDS
  - ✅ Submit to Email - Send to arescom.rmis@gmail.com

  What Admin CANNOT Do:
  - ❌ Cannot permanently delete RIDS (super admin only)

  ---
  4. SUPER ADMIN (Web Application)

  All Admin Features +:
  - ✅ Full System Access - View/edit all RIDS regardless of company
  - ✅ Delete RIDS - Soft delete with audit trail (only role with delete permission)
  - ✅ Manage RIDS Workflow - Override any status
  - ✅ Full Audit Trail Access - View all system changes

  ---
  Key Workflow: Who Creates and Fills RIDS?

  Answer: STAFF creates and fills out the RIDS

  Process:
  1. Staff logs into web app
  2. Staff creates new RIDS using multi-step form wizard
  3. Staff enters all 12 sections:
    - Section 1: Personnel Information (rank, AFPSN, unit, etc.)
    - Section 2: Personal Information (address, contact, IDs, etc.)
    - Section 3-10: Service records (promotions, training, awards, etc.)
    - Section 11: Upload biometrics (photo, thumbmark, signature)
    - Section 12: Supporting documents
  4. Staff submits to Reservist for certification
  5. Reservist reviews and certifies (signs "I HEREBY CERTIFY...")
  6. Staff submits for verification
  7. Admin reviews and either:
    - ✅ Approves → Status: VERIFIED
    - ❌ Rejects → Staff makes corrections and resubmits
  8. Admin sends verified RIDS to arescom.rmis@gmail.com

  ---
  Mobile App vs Web App Split

  | Feature        | Reservist (Mobile)   | Staff/Admin (Web)        |
  |----------------|----------------------|--------------------------|
  | Create RIDS    | ❌                    | ✅ Staff/Admin            |
  | Fill Out RIDS  | ❌                    | ✅ Staff/Admin            |
  | View RIDS      | ✅ Own only           | ✅ All (filtered by role) |
  | Edit RIDS      | ⚠️ Contact info only | ✅ Full edit              |
  | Certify RIDS   | ✅                    | ✅                        |
  | Verify/Approve | ❌                    | ✅ Admin only             |
  | Download PDF   | ✅                    | ✅                        |

  ---
  Summary

  - Reservists use the mobile app to view their RIDS and make limited updates (contact info only)
  - Staff use the web app to create, fill out, and submit RIDS for verification
  - Admin use the web app to verify/approve RIDS and manage the workflow
  - Super Admin has full control including delete capabilities

  The RIDS is NOT self-service for reservists - it's managed by staff on behalf of the reservists, with reservist involvement limited to certification
  and viewing.