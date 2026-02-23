# Vercel Deployment Setup Guide

## 🚨 Critical: Environment Variables Configuration

Your application works on localhost but fails on Vercel because **environment variables are not configured in Vercel**.

### Step-by-Step Guide to Fix Vercel Deployment

#### 1. Go to Vercel Dashboard
- Visit [https://vercel.com/](https://vercel.com/)
- Click on your project: **indian-penpal-league**

#### 2. Navigate to Environment Variables
- Click on **Settings** tab
- Click on **Environment Variables** in the left sidebar

#### 3. Add ALL These Environment Variables

Copy these values from your `.env.local` file:

```env
MONGODB_URI=mongodb+srv://indianpenpalsleague12395_db_user:UcBIAfGYBSoRoT6x@indianpenpalsleague.v1ddsbs.mongodb.net/ipl_db?retryWrites=true&w=majority

CLOUDINARY_CLOUD_NAME=dzxusfwqp

CLOUDINARY_API_KEY=312844462199269

CLOUDINARY_API_SECRET=9z6lUFxUU5LZGtw_RLLdy3driMs

JWT_SECRET=ipl-admin-secret-key-change-in-production

NODEMAILER_EMAIL=indianpenpalsleague12395@gmail.com

NODEMAILER_PASSWORD=jyfoujjstanvtjgc
```

#### 4. For Each Variable:
1. Click **Add New**
2. Enter the **Key** (e.g., `MONGODB_URI`)
3. Enter the **Value** (e.g., the MongoDB connection string)
4. Select environments: ✅ **Production**, ✅ **Preview**, ✅ **Development**
5. Click **Save**

#### 5. Redeploy After Adding Variables
After adding all variables:
- Go to **Deployments** tab
- Click the **•••** menu on the latest deployment
- Click **Redeploy**
- OR simply push a new commit to trigger automatic deployment

### Verification

After redeploying, visit:
```
https://indian-penpal-league.vercel.app/api/health
```

You should see:
```json
{
  "status": "ok",
  "environment": "production",
  "envVariables": {
    "MONGODB_URI": true,
    "JWT_SECRET": true,
    "CLOUDINARY_CLOUD_NAME": true,
    "CLOUDINARY_API_KEY": true,
    "CLOUDINARY_API_SECRET": true,
    "NODEMAILER_EMAIL": true,
    "NODEMAILER_PASSWORD": true
  },
  "allSet": true
}
```

If `allSet` is `false`, that variable is missing.

### Common Issues

**Q: I added variables but it still doesn't work**
- Make sure to **redeploy** after adding variables
- Check that variables are added for **Production** environment
- Variables must match exactly (no extra spaces)

**Q: How to check logs?**
- Go to Vercel Dashboard → Your Project → **Logs** tab
- Look for error messages showing what's failing

### Security Note
⚠️ Never commit `.env.local` to Git. It's already in `.gitignore`.

---

Once environment variables are configured, your Vercel deployment will work exactly like localhost! 🚀
