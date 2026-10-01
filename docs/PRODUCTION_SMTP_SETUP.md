# ReadyDocs Production SMTP Setup Guide

> **Issue**: *"Email rate limit exceeded"* during user registration or password reset.  
> **Root Cause**: Supabase's default shared email provider imposes a strict project-wide rate limit of **~2-3 emails per hour** on free tier projects.  
> **Resolution**: Configure a custom SMTP provider (recommended: **Resend**) in Supabase Auth settings to enable high-volume, reliable email delivery without disabling email verification.

---

## 1. Why Supabase Throttles Authentication Emails

By default, every Supabase project uses a shared, built-in email service intended strictly for rapid local development and prototyping. Supabase caps this service at approximately 2 to 3 emails per hour across your entire project to prevent spam abuse.

When multiple users register or request password resets during a demo or launch, Supabase returns HTTP `429`:
```json
{
  "code": 429,
  "msg": "Email rate limit exceeded",
  "error_code": "over_email_send_rate_limit"
}
```

**Do NOT disable email verification or alter authentication logic.** Instead, configure a Custom SMTP provider in Supabase.

---

## 2. Recommended SMTP Provider: Resend

[Resend](https://resend.com) is modern, developer-friendly, and provides:
- **3,000 free emails per month** (up to 100/day on free tier).
- Exceptional deliverability with built-in DKIM, SPF, and DMARC verification.
- Direct SMTP compatibility with Supabase Auth (`smtp.resend.com`).

---

## 3. Step-by-Step Setup Guide

### Step 3.1: Create a Resend Account & API Key
1. Go to [https://resend.com](https://resend.com) and create an account or log in.
2. In the left navigation, click **API Keys**.
3. Click **Create API Key**:
   - **Name**: `ReadyDocs-Supabase-Auth`
   - **Permission**: `Full access` (or `Sending access`)
   - **Domain**: Choose your verified domain (or `All Domains` if testing)
4. Click **Add** and immediately copy the API key (format: `re_1234567890abcdef...`).

---

### Step 3.2: Verify Sender Domain (Recommended for Production)
Using a custom verified domain ensures emails arrive directly in the user's primary inbox rather than Spam or Promotions.

1. In Resend, go to **Domains** -> **Add Domain**.
2. Enter your domain (e.g., `readydocs.in` or a dedicated subdomain like `mail.readydocs.in`).
3. Add the generated DNS records at your DNS registrar (Cloudflare, Namecheap, GoDaddy, AWS Route 53, etc.):
   - **DKIM** (TXT): `resend._domainkey` -> value provided by Resend
   - **SPF** (MX / TXT): `bounces` -> value provided by Resend
   - **DMARC** (TXT): `_dmarc` -> `v=DMARC1; p=none;`
4. Click **Verify DNS Records** in Resend until the domain shows green status: **Verified**.

> **Sandbox / Fast Prototyping Note**:  
> If you do not have a custom domain ready yet, Resend allows sending test emails from `onboarding@resend.dev` directly to the email address registered with your Resend account.

---

### Step 3.3: Configure Supabase SMTP Settings

1. Open your **Supabase Dashboard**:  
   `https://supabase.com/dashboard/project/<your-project-ref>/settings/auth`
2. Scroll to the **SMTP Settings** section (or **Authentication** -> **Email Templates / SMTP**).
3. Toggle **Enable Custom SMTP** to **ON**.
4. Configure the following fields:

| Field | Value | Notes |
|---|---|---|
| **Sender Email** | `noreply@yourdomain.com` *(or `onboarding@resend.dev` for sandbox testing)* | Must match your verified domain in Resend |
| **Sender Name** | `ReadyDocs` | Shown as display name in inbox |
| **Host** | `smtp.resend.com` | Resend SMTP endpoint |
| **Port** | `465` (SSL) or `587` (TLS) | Standard SMTP ports |
| **Minimum Interval** | `60` | Minimum seconds between emails per user |
| **User** | `resend` | Literal string `resend` |
| **Password** | `<YOUR_RESEND_API_KEY>` | e.g. `re_xxxxxxxxxxxxxxxx` |

5. Click **Save** at the bottom of the page.

---

## 4. Credential & Environment Security

> [!CAUTION]
> **NEVER commit SMTP passwords, Resend API keys, or Supabase service keys to GitHub.**

- **Supabase SMTP Credentials**: Managed exclusively via the secure Supabase Dashboard. Supabase encrypts and stores SMTP credentials internally.
- **Vercel Environment Variables**:
  If server-side custom notification scripts are added in the future, set environment variables directly in **Vercel Project Settings → Environment Variables**:
  - `RESEND_API_KEY`: `re_xxxxxxxxxxxxxxxx` (Production & Preview)
- **Local Development**:
  Store keys only in local `.env` files. Both `server/.env` and `client/.env` are protected by `.gitignore` in this repository.

---

## 5. Production Testing Checklist

After saving the SMTP settings in Supabase, execute this 5-point verification checklist:

1. [ ] **New User Registration**:
   - Go to `/register` on the deployed site.
   - Register with a brand new email address.
   - Verify that the confirmation message appears with no 429 rate limit error.
2. [ ] **Confirmation Email Delivery**:
   - Check the destination inbox.
   - Verify sender is `ReadyDocs <noreply@yourdomain.com>` (or `onboarding@resend.dev`).
   - Check that the confirmation link works and redirects to the ReadyDocs dashboard.
3. [ ] **Email Confirmation & Login**:
   - Confirm the email link.
   - Log in with the confirmed credentials at `/login`.
   - Verify user profile is loaded in the dashboard.
4. [ ] **Password Reset Verification**:
   - Go to `/login` and click **Forgot Password?**.
   - Enter your email and click **Send Reset Link**.
   - Verify that the reset password email is received and that the reset link functions.
5. [ ] **Multi-User Concurrency Test**:
   - Register 3 to 5 test accounts in quick succession.
   - Confirm that all confirmation emails are dispatched without hitting any rate limit.

---

## 6. Guidance for Current Demo Evaluators

While the Supabase project rate limit is resetting or until custom SMTP is saved in the dashboard:

1. **Wait for Rate Limit Reset**:
   - If a user encountered *"Email rate limit exceeded"*, Supabase's hourly window resets approximately 30 to 60 minutes after the first email was triggered.
2. **Do Not Spam Buttons**:
   - Avoid repeatedly clicking **Create Account**, **Register**, or **Resend**. Each rapid retry will trigger another 429 error and may extend the cooldown.
3. **Use Existing Accounts**:
   - Users already confirmed in the system can log in immediately at `/login` without triggering any outgoing authentication emails.

---

## 7. Troubleshooting: "Error sending confirmation email"

If registration displays **"Error sending confirmation email"** after enabling Resend Custom SMTP in Supabase, execute these 6 diagnostic checks:

### Diagnostic Check 1: Inspect Supabase Logs → Auth Logs
- Navigate to: **Supabase Dashboard** → **Logs** → **Auth Logs** (or filter by `event_message` contains `mail`).
- Look for the error payload from `smtp.resend.com`:
  - `554 Message rejected: You can only send testing emails to your own email address...` → **Cause**: Check 4 (recipient mismatch with `onboarding@resend.dev`).
  - `535 Authentication failed` → **Cause**: Check 2 or Check 5 (invalid key, extra whitespace, or swapped username/password).
  - `550 The from address does not match any verified domain` → **Cause**: Check 3 (sender email mismatch).
  - `i/o timeout` / `connection refused` on port 465 → **Fix**: Switch port to `587` (TLS) or verify firewall restrictions.

### Diagnostic Check 2: Verify Resend API Key Validity & Permissions
- Go to [resend.com/api-keys](https://resend.com/api-keys).
- Verify the API key is **active** and has **"Sending access"** or **"Full access"**.
- Ensure the key was not domain-restricted to a domain different from the one configured in Supabase.
- When pasting into Supabase SMTP Password, ensure there are no leading/trailing spaces or quotes.

### Diagnostic Check 3: Verify Sender Email is Exactly `onboarding@resend.dev`
- In Supabase Dashboard → **Authentication** → **SMTP Settings**:
  - The **Sender Email** must be typed exactly as: `onboarding@resend.dev`.
  - Check for typos (e.g. `onboarding@resend.com` or `resend.io` will be rejected).
  - Note: Any sender address other than `onboarding@resend.dev` requires a domain verified in Resend.

### Diagnostic Check 4: Test Recipient Email Match (CRITICAL for `onboarding@resend.dev`)
> [!IMPORTANT]
> **This is the #1 cause of this error when using Resend's free test sender.**
> Resend enforces a strict sandbox rule: `onboarding@resend.dev` **can ONLY send emails to the email address used to create the Resend account**.
- If you attempt to register with any other email address (e.g., `test1@gmail.com`), Resend rejects the message immediately with `554 Message rejected`.
- **To test immediately**: Register on ReadyDocs using the **exact email address** associated with your Resend account.
- **To enable public registration**: You must verify a custom domain in Resend (`resend.com/domains`) and set your Supabase Sender Email to `noreply@yourdomain.com`.

### Diagnostic Check 5: Verify SMTP Username & Password Fields are NOT Swapped
- In Supabase **SMTP Settings**:
  - **User (Username)**: Must be `resend` (the literal 6 characters `resend`, NOT your email address).
  - **Password**: Must be your Resend API Key (`re_xxxxxxxxxxxxxxxx`).
  - Swapping these two fields will immediately result in `535 Authentication failed`.

### Diagnostic Check 6: Verify Supabase URL Configuration
- In Supabase Dashboard → **Authentication** → **URL Configuration**:
  - **Site URL**: `https://readydocs-code-titans24.vercel.app`
  - **Redirect URLs** must include:
    - `https://readydocs-code-titans24.vercel.app/**`
    - `https://readydocs-code-titans24.vercel.app/dashboard`
    - `http://localhost:5173/**` (for local development)
  - Ensure the trailing wildcards and protocol (`https://`) match the deployed Vercel domain exactly.
