# Railway Deployment Guide

## Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)
- Your code pushed to GitHub

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Deploy on Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your repository: `mcm-pharmacy`
6. Railway will automatically detect it's a Node.js project

### 3. Configure Environment Variables

After deployment starts, click on your project, then:

1. Go to "Variables" tab
2. Add these environment variables:

```
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://ivwviiupkkrrrtmnksyk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2d3ZpaXVwa2tycnJ0bW5rc3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NjYxODUsImV4cCI6MjA4MjI0MjE4NX0.1VeDUVohh-UzykTrvTjaZ1lxg51rUaSw_ul4Wu4N0Pg
ALLOWED_ORIGINS=*
```

**Important:** Replace `ALLOWED_ORIGINS=*` with your actual frontend URL once deployed.

### 4. Deploy

Railway will automatically:
- Install dependencies (`npm install`)
- Start your app (`npm start`)
- Assign a public URL

### 5. Get Your API URL

1. Go to "Settings" tab
2. Under "Domains", you'll see your Railway URL (e.g., `your-app.up.railway.app`)
3. Click "Generate Domain" if not already generated

### 6. Test Your Deployment

Your API will be available at:
```
https://your-app.up.railway.app/health
https://your-app.up.railway.app/api/pharmacy/check
```

Test with curl:
```bash
curl https://your-app.up.railway.app/health
```

## Alternative: Deploy via Railway CLI

### Install Railway CLI
```bash
npm i -g @railway/cli
```

### Login
```bash
railway login
```

### Initialize and Deploy
```bash
railway init
railway up
```

### Add Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=your_url
railway variables set SUPABASE_ANON_KEY=your_key
```

## Monitoring

1. View logs: Click "Deployments" → Select deployment → "View Logs"
2. Check metrics: "Metrics" tab shows CPU, memory, network usage
3. Restart: "Settings" → "Restart"

## Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Click "Custom Domain"
3. Add your domain (e.g., api.yourdomain.com)
4. Update DNS records as instructed

## Troubleshooting

### Deployment Failed
- Check logs in Railway dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct start script

### API Not Responding
- Check if PORT environment variable is set
- Verify Supabase credentials are correct
- Check CORS settings in ALLOWED_ORIGINS

### Database Connection Issues
- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Check Supabase project is active
- Ensure network policies allow Railway IPs

## Cost

Railway offers:
- $5 free credit per month
- Pay-as-you-go after free tier
- Typical small API costs ~$5-10/month

## Updating Your App

After making changes:
```bash
git add .
git commit -m "Update API"
git push origin main
```

Railway will automatically redeploy!

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment mode | production |
| PORT | Server port (auto-set by Railway) | 3000 |
| SUPABASE_URL | Your Supabase project URL | https://xxx.supabase.co |
| SUPABASE_ANON_KEY | Supabase anonymous key | eyJhbG... |
| ALLOWED_ORIGINS | CORS allowed origins | https://yourfrontend.com |

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Supabase Docs: https://supabase.com/docs
