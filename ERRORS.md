 ✓ Compiled /api/staff/training/[id] in 1537ms
Error: Route "/api/staff/training/[id]" used `params.id`. `params` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at GET (src\app\api\staff\training\[id]\route.ts:61:24)
  59 |       .from('training_sessions')
  60 |       .select('*')
> 61 |       .eq('id', params.id)
     |                        ^
  62 |       .single();
  63 |
  64 |     if (error) {
Error: Route "/api/staff/training/[id]" used `params.id`. `params` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at GET (src\app\api\staff\training\[id]\route.ts:79:94)
  77 |     }
  78 |
> 79 |     logger.success('Fetched training session details', { userId: user.id, trainingId: params.id });
     |                                                                                              ^
  80 |
  81 |     return NextResponse.json({ success: true, data });
  82 |   } catch (error) {
[2025-10-05 07:50:28] ✅ SUCCESS | Fetched training session details [ID: 4c73648f...]