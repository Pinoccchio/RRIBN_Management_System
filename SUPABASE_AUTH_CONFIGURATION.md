# ⚠️ CRITICAL: Supabase Authentication Configuration

This document contains **REQUIRED** configuration steps for Supabase Auth to work properly, especially for password reset functionality.

## 🚨 Must Complete IMMEDIATELY

### 1. Configure Redirect URLs (CRITICAL - Password Reset Won't Work Without This!)

**Go to:** https://supabase.com/dashboard/project/wvnxdgoenmqyfvymxwef/auth/url-configuration

**Add these URLs to "Redirect URLs" section:**

#### For Local Development:
```
http://localhost:3000/**
http://localhost:3000/update-password
http://localhost:3000/signin
```

#### For Production (when deployed):
```
https://yourdomain.com/**
https://yourdomain.com/update-password
https://yourdomain.com/signin
```

**Set Site URL:**
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

---

### 2. Update Email Template for Password Reset (CRITICAL)

**Go to:** https://supabase.com/dashboard/project/wvnxdgoenmqyfvymxwef/auth/templates

**Select:** "Reset Password" template

**Replace the template content with:**

```html
<h2>Reset Your Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .SiteURL }}/update-password?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a></p>

<p>Alternatively, enter the code: {{ .Token }}</p>

<p>If you didn't request a password reset, you can safely ignore this email.</p>
```

**Why this is important:**
- The default template uses `{{ .ConfirmationURL }}` which is for implicit flow
- Your app uses PKCE flow (via `@supabase/ssr`)
- PKCE flow requires `token_hash` parameter, not `code` parameter
- The new template correctly formats the URL for PKCE flow

---

### 3. Verify Email Provider Settings (Optional but Recommended)

**Go to:** https://supabase.com/dashboard/project/wvnxdgoenmqyfvymxwef/auth/providers

**Email Provider Settings:**
- ✅ Enable Email Provider: ON
- ✅ Confirm Email: OFF (for development) or ON (for production)
- ✅ Secure Email Change: ON (recommended)

**Rate Limits:**
- Password Recovery: Default is fine (1 request per hour per email)

---

## 📝 What Was Fixed in the Code

### 1. UpdatePasswordForm.tsx
Added PKCE token exchange logic that:
- Checks URL for `token_hash` parameter
- Exchanges token for active session using `supabase.auth.verifyOtp()`
- Enables password reset mode upon successful exchange
- Cleans up URL after exchange

### 2. Email Flow (After Configuration)
**Before (Broken):**
```
User clicks email link → http://localhost:3000/update-password?code=xxx
→ Code can't be exchanged → "Invalid or Expired Link" error
```

**After (Fixed):**
```
User clicks email link → http://localhost:3000/update-password?token_hash=xxx&type=recovery
→ Token exchanged for session → Password reset form shown → User updates password ✓
```

---

## 🧪 How to Test

1. **Request Password Reset:**
   ```
   Go to http://localhost:3000/forgot-password
   Enter your email
   Click "Send Reset Link"
   ```

2. **Check Email:**
   - You should receive an email with subject "Reset Your Password"
   - Click the link in the email

3. **Expected Behavior:**
   - Browser opens: `http://localhost:3000/update-password?token_hash=...&type=recovery`
   - URL gets cleaned to: `http://localhost:3000/update-password`
   - Form appears with "Update Password" heading
   - You can enter new password and submit

4. **After Successful Reset:**
   - Redirected to `/signin?passwordUpdated=true`
   - Can sign in with new password

---

## 🔍 Troubleshooting

### Still Getting "Invalid or Expired Link"?

**Check:**
1. ✅ Did you add redirect URLs in Supabase Dashboard? (Step 1)
2. ✅ Did you update the email template? (Step 2)
3. ✅ Is the email link format correct? Should have `?token_hash=...&type=recovery`
4. ✅ Did you wait for email template changes to take effect? (Usually immediate)
5. ✅ Request a NEW password reset (old emails won't work with new template)

### Token Expired Error?

Password reset tokens expire after:
- **Default:** 1 hour
- **Configurable at:** Auth > Providers > Email > Email OTP Expiration

**Solution:** Request a new password reset link

### Email Not Arriving?

**Check:**
1. Spam folder
2. Email provider settings in Supabase
3. Supabase logs for email sending errors
4. Default Supabase SMTP has rate limits (30 emails/hour)

---

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] Update Site URL to production domain
- [ ] Add production domain to Redirect URLs (with `/**` wildcard)
- [ ] Set up custom SMTP (optional, but recommended for reliability)
- [ ] Enable Email Confirmation (recommended for security)
- [ ] Test password reset flow on production domain
- [ ] Update email template branding (optional)

---

## 📚 Additional Resources

- [Supabase Auth Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [PKCE Flow Documentation](https://supabase.com/docs/guides/auth/sessions/pkce-flow)
- [Server-Side Auth](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Redirect URLs Configuration](https://supabase.com/docs/guides/auth/overview#redirect-urls-and-wildcards)

---

## 🆘 Need Help?

If you're still experiencing issues after following this guide:

1. Check browser console for error messages
2. Check Supabase logs: https://supabase.com/dashboard/project/wvnxdgoenmqyfvymxwef/logs
3. Review the Auth logs for failed authentication attempts
4. Contact support with specific error messages

---

**Last Updated:** January 2025
**Project:** RRIBN Management System
**Supabase Project ID:** wvnxdgoenmqyfvymxwef
