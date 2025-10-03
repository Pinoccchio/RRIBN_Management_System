Console Error


In HTML, <div> cannot be a descendant of <p>.
This will cause a hydration error.

See more info here: https://nextjs.org/docs/messages/react-hydration-error


...
    <InnerLayoutRouter url="/super-adm..." tree={[...]} cacheNode={{lazyData:null, ...}} segmentPath={[...]}>
      <SegmentViewNode type="page" pagePath="(dashboard...">
        <SegmentTrieNode>
        <ClientPageRoot Component={function StaffPage} searchParams={{}} params={{}}>
          <StaffPage params={Promise} searchParams={Promise}>
            <div>
              <PageHeader>
              <Card>
              <Card>
              <CreateStaffModal>
              <ViewStaffModal>
              <EditStaffModal>
              <DeleteStaffModal isOpen={true} onClose={function onClose} onConfirm={function handleDeleteConfirm} ...>
                <ConfirmationModal isOpen={true} onClose={function onClose} onConfirm={function handleDeleteConfirm} ...>
                  <Modal isOpen={true} onClose={function onClose} title="Delete Sta..." size="sm" showCloseButton={true}>
                    <div className="jsx-d287f3...">
                      <div>
                      <div className="jsx-d287f3...">
                        <div className="jsx-d287f3...">
                          <div>
                          <div className="jsx-d287f3...">
                            <div className="space-y-4">
                              <div>
>                             <p className="text-center text-gray-700 leading-relaxed">
                                <div className="space-y-4">
                                  <div className="flex items...">
                                    <Avatar firstName="Staff" lastName="User" src={null} size="lg">
                                      <div className="relative i...">
>                                       <div
>                                         className="rounded-full flex items-center justify-center font-semibold overf..."
>                                         style={{backgroundColor:"#F59E0B"}}
>                                       >
                                    ...
                                  ...
                            ...
                      ...
      ...
src/components/ui/Avatar.tsx (41:7) @ Avatar


  39 |   return (
  40 |     <div className={cn('relative inline-block', className)}>
> 41 |       <div
     |       ^
  42 |         className={cn(
  43 |           'rounded-full flex items-center justify-center font-semibold overflow-hidden',
  44 |           sizeClasses[size],
Call Stack
20

Show 16 ignore-listed frame(s)
div
<anonymous>
Avatar
src/components/ui/Avatar.tsx (41:7)
DeleteStaffModal
src/components/dashboard/staff/DeleteStaffModal.tsx (41:13)
StaffPage
src/app/(dashboard)/super-admin/staff/page.tsx (325:7)
Console Error


<p> cannot contain a nested <div>.
See this log for the ancestor stack trace.

src/components/ui/ConfirmationModal.tsx (89:9) @ ConfirmationModal


  87 |
  88 |         {/* Message */}
> 89 |         <p className="text-center text-gray-700 leading-relaxed">
     |         ^
  90 |           {message}
  91 |         </p>
  92 |       </div>
Call Stack
22

Show 18 ignore-listed frame(s)
p
<anonymous>
ConfirmationModal
src/components/ui/ConfirmationModal.tsx (89:9)
DeleteStaffModal
src/components/dashboard/staff/DeleteStaffModal.tsx (32:5)
StaffPage
src/app/(dashboard)/super-admin/staff/page.tsx (325:7)
Console Error


In HTML, <p> cannot be a descendant of <p>.
This will cause a hydration error.

See more info here: https://nextjs.org/docs/messages/react-hydration-error


...
    <InnerLayoutRouter url="/super-adm..." tree={[...]} cacheNode={{lazyData:null, ...}} segmentPath={[...]}>
      <SegmentViewNode type="page" pagePath="(dashboard...">
        <SegmentTrieNode>
        <ClientPageRoot Component={function StaffPage} searchParams={{}} params={{}}>
          <StaffPage params={Promise} searchParams={Promise}>
            <div>
              <PageHeader>
              <Card>
              <Card>
              <CreateStaffModal>
              <ViewStaffModal>
              <EditStaffModal>
              <DeleteStaffModal isOpen={true} onClose={function onClose} onConfirm={function handleDeleteConfirm} ...>
                <ConfirmationModal isOpen={true} onClose={function onClose} onConfirm={function handleDeleteConfirm} ...>
                  <Modal isOpen={true} onClose={function onClose} title="Delete Sta..." size="sm" showCloseButton={true}>
                    <div className="jsx-d287f3...">
                      <div>
                      <div className="jsx-d287f3...">
                        <div className="jsx-d287f3...">
                          <div>
                          <div className="jsx-d287f3...">
                            <div className="space-y-4">
                              <div>
>                             <p className="text-center text-gray-700 leading-relaxed">
                                <div className="space-y-4">
                                  <div className="flex items...">
                                    <Avatar>
                                    <div className="flex-1 min...">
>                                     <p className="font-semibold text-navy-900 truncate">
                                      ...
                                  ...
                            ...
                      ...
      ...
src/components/dashboard/staff/DeleteStaffModal.tsx (48:15) @ DeleteStaffModal


  46 |             />
  47 |             <div className="flex-1 min-w-0">
> 48 |               <p className="font-semibold text-navy-900 truncate">{fullName}</p>
     |               ^
  49 |               <p className="text-sm text-gray-600 truncate">{staff.email}</p>
  50 |               <div className="flex items-center gap-2 mt-2 flex-wrap">
  51 |                 <StatusBadge status={staff.status} size="sm" />
Call Stack
19

Show 16 ignore-listed frame(s)
p
<anonymous>
DeleteStaffModal
src/components/dashboard/staff/DeleteStaffModal.tsx (48:15)
StaffPage
src/app/(dashboard)/super-admin/staff/page.tsx (325:7)
1Console Error


<p> cannot contain a nested <p>.
See this log for the ancestor stack trace.

src/components/ui/ConfirmationModal.tsx (89:9) @ ConfirmationModal


  87 |
  88 |         {/* Message */}
> 89 |         <p className="text-center text-gray-700 leading-relaxed">
     |         ^
  90 |           {message}
  91 |         </p>
  92 |       </div>
Call Stack
22

Show 18 ignore-listed frame(s)
p
<anonymous>
ConfirmationModal
src/components/ui/ConfirmationModal.tsx (89:9)
DeleteStaffModal
src/components/dashboard/staff/DeleteStaffModal.tsx (32:5)
StaffPage
src/app/(dashboard)/super-admin/staff/page.tsx (325:7)
1