# Revision List

## 1. Homescreen Overhaul: Focus on Prescriptive Analytics

**Objective:** Redesign the homescreen to provide immediate, actionable information to the user regarding their career progression.

### Key Changes:

- **Prioritize Promotion Status**: The most prominent feature on the homescreen should be a clear and concise indicator of the user's promotion eligibility. This could be a notification or a dedicated section.

- **Implement Prescriptive Analytics**: Instead of just showing data, the system should provide recommendations. For example:
  - "You are qualified for [Next Rank]"
  - "You need to complete [Requirement] to be eligible for promotion"

- **Eliminate Redundancy**: Remove the training and document upload statistics from the homescreen, as these have their own dedicated sections.

- **Re-evaluate "Quick Stats"**: The term "quick stats" is not ideal. While information like "2 pending documents" is valuable, it should be integrated into the overall prescriptive analytics.

---

## 2. Training Section and Promotion Checklist

**Objective:** Enhance the training section to be a tool for career advancement.

### Key Changes:

- **Integrate Promotion Checklist**: The system must generate a checklist of requirements for the user's next rank. This should be easily accessible.

- **Dynamic Checklist**: The checklist should clearly indicate which requirements the user has met and which are still outstanding.
  - **Example**: If a user's current rank is Corporal, the app should display a checklist of all requirements to become a Sergeant.

---

## 3. System Scope: Focus on Non-Commissioned Personnel

**Objective:** To focus the system's current operational scope on non-commissioned personnel (Private to Sergeant) while maintaining the backend architecture for future expansion to include commissioned officers.

### Key Changes:

- **Limit Current Functionality**: All current user-facing features, including promotion checklists, prescriptive analytics, and data displays, must be filtered and logically scoped to apply only to the non-commissioned ranks (Private through Sergeant).

- **Retain Backend Structure for Future Scalability**: Do not remove the ranks or data structures for commissioned officers (Lieutenant to General) from the database. The system's architecture should simply exclude them from the current application logic, ensuring they are available for future system upgrades when the client is ready to expand the scope.
