

1/3

Next.js 15.5.4
Turbopack
Console Error


[2m   └─ Error Details:[0m "Invalid login credentials"

src/lib/logger.ts (106:15) @ Logger.error


  104 |     this.log('ERROR', message, options);
  105 |     if (error && this.isDevelopment) {
> 106 |       console.error(`${this.colors.DIM}   └─ Error Details:${this.colors.RESET}`, error);
      |               ^
  107 |     }
  108 |   }
  109 |
Call Stack
7

Show 3 ignore-listed frame(s)
Logger.error
src/lib/logger.ts (106:15)
Logger.authError
src/lib/logger.ts (142:10)Console AuthApiError


Invalid login credentials

src/contexts/AuthContext.tsx (165:31) @ async signIn


  163 |
  164 |     try {
> 165 |       const { error, data } = await supabase.auth.signInWithPassword({
      |                               ^
  166 |         email,
  167 |         password,
  168 |       });
Call Stack
6

handleError
file:///C:/Users/User/Documents/first_year_files/folder_for_jobs/ARMY/Capstone2_System_Documents/rribn_management_system/.next/static/chunks/node_modules_ab66c8b8._.js (7838:11)
async _handleRequest
file:///C:/Users/User/Documents/first_year_files/folder_for_jobs/ARMY/Capstone2_System_Documents/rribn_management_system/.next/static/chunks/node_modules_ab66c8b8._.js (7888:9)
async _request
file:///C:/Users/User/Documents/first_year_files/folder_for_jobs/ARMY/Capstone2_System_Documents/rribn_management_system/.next/static/chunks/node_modules_ab66c8b8._.js (7868:18)
async SupabaseAuthClient.signInWithPassword
file:///C:/Users/User/Documents/first_year_files/folder_for_jobs/ARMY/Capstone2_System_Documents/rribn_management_system/.next/static/chunks/node_modules_ab66c8b8._.js (8898:23)
async signIn
src/contexts/AuthContext.tsx (165:31)
async handleSubmit
src/components/auth/SignInForm.tsx (85:25)
Runtime TypeError


Cannot destructure property 'label' of 'data' as it is undefined.

src/components/dashboard/stats/StatCard.tsx (13:11) @ StatCard


  11 |
  12 | export const StatCard: React.FC<StatCardProps> = ({ data }) => {
> 13 |   const { label, value, change, changeLabel, icon, trend, color = 'primary' } = data;
     |           ^
  14 |
  15 |   // Color variants
  16 |   const colorClasses = {
Call Stack
14

Show 12 ignore-listed frame(s)
StatCard
src/components/dashboard/stats/StatCard.tsx (13:11)
AdminDashboardPage
src/app/(dashboard)/admin/page.tsx (20:9)


1/1

Next.js 15.5.4
Turbopack
Runtime TypeError


Cannot destructure property 'label' of 'data' as it is undefined.

src/components/dashboard/stats/StatCard.tsx (13:11) @ StatCard


  11 |
  12 | export const StatCard: React.FC<StatCardProps> = ({ data }) => {
> 13 |   const { label, value, change, changeLabel, icon, trend, color = 'primary' } = data;
     |           ^
  14 |
  15 |   // Color variants
  16 |   const colorClasses = {
Call Stack
14

Show 12 ignore-listed frame(s)
StatCard
src/components/dashboard/stats/StatCard.tsx (13:11)
AdminDashboardPage
src/app/(dashboard)/admin/page.tsx (20:9)