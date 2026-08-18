# Firebase App Hosting Deployment Guide

Your portfolio application is now configured for deployment on **Firebase App Hosting**. This guide provides step-by-step instructions.

## Prerequisites

- ✅ Firebase project created (Project ID: `fpmontrano`)
- ✅ Firebase CLI installed (`npm install -g firebase-tools`)
- ✅ Authenticated with Firebase (`firebase login`)
- ✅ Application properly configured in `apphosting.yaml`

## Changes Applied

The following fixes were applied to ensure Firebase compatibility:

1. **✅ Fixed Google Fonts Issue** — Removed Google Fonts API dependency which fails in isolated cloud environments. Now using system monospace fonts with fallbacks.
   - Removed `next/font/google` import from `src/app/layout.tsx`
   - Added fallback fonts in `src/app/globals.css`

2. **✅ Fixed Module Type Warning** — Added `"type": "module"` to `package.json` to prevent Node.js module parsing warnings during build.

3. **✅ Cleaned Up Configuration** — Removed duplicate `next.config.js` (TypeScript version is now the single source of truth).

4. **✅ Verified Deployment Config** — `apphosting.yaml` is correctly configured with:
   - Build command: `npm run build`
   - Run command: `npm start`
   - Cloud Run resources: 1 vCPU, 512 MB RAM
   - All public environment variables defined
   - Secret management for `ADMIN_PASSWORD`

---

## Deployment Steps

### Step 1: Set Up Secrets in Firebase

The `apphosting.yaml` references `PORTFOLIO_ADMIN_PASSWORD` as a secret. Set it in Firebase:

```bash
firebase apphosting:secrets:set PORTFOLIO_ADMIN_PASSWORD
# You'll be prompted to enter your admin password securely
```

### Step 2: (Optional) Update Environment Variables

If you need to change any public environment variables (name, email, social links, etc.):

1. Edit `apphosting.yaml`
2. Update the desired variable values under the `env:` section
3. Deploy (Step 3 below)

### Step 3: Deploy to Firebase App Hosting

**Option A: Using Firebase CLI (Recommended)**

```bash
cd /Users/fmontrano/Desktop/Personal/portfolio

# Deploy the backend
firebase apphosting:deploy
```

You'll see:
- Build phase logs (npm run build)
- Deployment progress
- Live URL of your deployed application

**Option B: Using Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project `fpmontrano`
3. Navigate to **App Hosting**
4. Click **Deploy**
5. Monitor build and deployment progress

### Step 4: Verify Deployment

```bash
# View deployment logs
firebase apphosting:logs:get

# Check the live site
firebase open apphosting
```

---

## Accessing Your Deployed Application

After deployment completes, your site will be available at:

```
https://<backend-id>-<project-id>.web.app
https://portfolio-be-fpmontrano.web.app
```

The exact URL will be shown in the deployment logs.

---

## Admin Panel Access

Once deployed, access the admin panel at:

```
https://<your-deployed-url>/admin
```

Login with your `ADMIN_PASSWORD` to manage:
- Skills and technologies
- Projects and portfolio items
- Experience and education
- Languages and proficiency levels
- Content localization (English/Italian)
- Easter eggs

---

## Environment Variables Reference

### Build-Time Variables (Available during npm run build)

- `NEXT_PUBLIC_*` variables
- These are baked into the Next.js build

### Runtime Variables (Available during npm start)

- All `NEXT_PUBLIC_*` variables
- `ADMIN_PASSWORD` (provided via secret)
- Any custom secrets set via `firebase apphosting:secrets:set`

---

## Monitoring & Logs

### View Build Logs

```bash
firebase apphosting:logs:get
```

### View Application Logs

Firebase Console → App Hosting → Logs tab

### Real-Time Logs (tail)

```bash
firebase apphosting:logs:get --follow
```

---

## Troubleshooting

### Build Fails with "No such file or directory"

Ensure you're in the correct directory:
```bash
cd /Users/fmontrano/Desktop/Personal/portfolio
```

### Secret Not Found Error During Deployment

Set the missing secret:
```bash
firebase apphosting:secrets:set PORTFOLIO_ADMIN_PASSWORD
```

### Admin Panel Password Not Working

1. Verify `PORTFOLIO_ADMIN_PASSWORD` is set in Firebase
2. Check that the secret matches what you're using
3. Redeploy to apply the new secret

### Site Shows "502 Bad Gateway"

The application is likely still starting. Wait 30-60 seconds and refresh.

### Environment Variables Not Loading

1. Verify variables are defined in `apphosting.yaml` with correct `availability` settings
2. For secrets, ensure they're set via `firebase apphosting:secrets:set`
3. Redeploy after updating `apphosting.yaml`

---

## Rollback to Previous Version

```bash
firebase apphosting:rollback
```

Select the previous version from the list to revert.

---

## Performance Tuning

Current Cloud Run configuration:
- **CPU**: 1 vCPU
- **Memory**: 512 MB
- **Min Instances**: 0 (cold starts - ideal for low-traffic sites)
- **Max Instances**: 1

### If You Need Higher Performance

Edit `apphosting.yaml`:

```yaml
runConfig:
  minInstances: 1      # Keep at least 1 instance warm
  maxInstances: 5      # Allow scaling to 5 instances
  cpu: 2               # Increase to 2 vCPU
  memoryMiB: 1024      # Increase to 1 GB
```

Then redeploy. **Note**: Higher resources increase Firebase billing.

---

## Cost Estimation

Firebase App Hosting pricing (as of 2024):
- **Build time**: $0.04 per build-minute
- **Cloud Run compute**: $0.00003611 per vCPU-hour + $0.00000556 per GB-hour
- **Network egress**: $0.12 per GB

Your current config with minimal traffic:
- ~$0 per month (minimal usage is free tier eligible)

---

## Next Steps

1. ✅ All configuration changes applied
2. **Run** `firebase apphosting:secrets:set PORTFOLIO_ADMIN_PASSWORD`
3. **Deploy** using `firebase apphosting:deploy`
4. **Verify** your site is live at the deployed URL
5. **Test** the admin panel at `/admin`

---

## Additional Resources

- [Firebase App Hosting Docs](https://firebase.google.com/docs/app-hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)

