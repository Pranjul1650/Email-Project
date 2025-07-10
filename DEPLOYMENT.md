# Deployment Guide

This guide will help you deploy the Resilient Email Service to various platforms.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Pranjul1650/Email)

**Manual Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Pranjul1650/Email)

**Manual Deployment:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

1. Go to your repository Settings > Pages
2. Select source: GitHub Actions
3. The build will deploy automatically on push to main

## 🔧 Environment Variables

For production deployment, configure these environment variables in your deployment platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Platform-Specific Setup:

#### Vercel
1. Go to your project dashboard
2. Settings > Environment Variables
3. Add the variables above

#### Netlify
1. Site settings > Environment variables
2. Add the variables above

#### GitHub Pages
1. Repository Settings > Secrets and variables > Actions
2. Add repository secrets with the variables above

## 🗄️ Database Setup

The Supabase database is already configured with:
- All necessary tables and relationships
- Row Level Security (RLS) policies
- Edge Functions for API endpoints

No additional database setup is required.

## 🔍 Post-Deployment Checklist

After deployment, verify:

1. **Application loads correctly**
   - Visit your deployed URL
   - Check that the interface loads without errors

2. **API endpoints work**
   - Test sending an email through the interface
   - Verify email status tracking
   - Check provider health monitoring

3. **Database connectivity**
   - Confirm emails are being stored in Supabase
   - Verify attempt history is being tracked

4. **Environment variables**
   - Ensure Supabase connection is working
   - Check for any configuration errors

## 🚨 Troubleshooting

### Common Issues:

#### "Missing Supabase environment variables"
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Check that variables don't contain placeholder values

#### "Failed to send email"
- Verify Supabase Edge Functions are deployed
- Check Supabase project is active and accessible

#### Build failures
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`

### Getting Help:

1. Check the [Issues](https://github.com/Pranjul1650/Email/issues) page
2. Create a new issue with:
   - Deployment platform used
   - Error messages
   - Steps to reproduce

## 📊 Monitoring Production

After deployment, monitor:

- **Email delivery rates** through the monitoring dashboard
- **Provider health** and circuit breaker states
- **Error logs** in your deployment platform's console
- **Database usage** in Supabase dashboard

## 🔄 Updates and Maintenance

To update your deployment:

1. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```

2. **Automatic deployment** will trigger on most platforms

3. **Manual redeploy** if needed:
   - Vercel: `vercel --prod`
   - Netlify: `netlify deploy --prod --dir=dist`

## 🔒 Security Considerations

For production:

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Use environment variables only
3. **Database**: RLS policies are already configured
4. **HTTPS**: Ensure your deployment uses HTTPS
5. **CORS**: Edge Functions have CORS configured for production

## 📈 Scaling

As your application grows:

1. **Supabase**: Automatically scales with usage
2. **Edge Functions**: Scale automatically with Supabase
3. **Frontend**: Static hosting scales automatically
4. **Database**: Monitor usage in Supabase dashboard

## 💰 Cost Considerations

- **Supabase**: Free tier includes generous limits
- **Vercel/Netlify**: Free tiers available for personal projects
- **GitHub Pages**: Free for public repositories

Monitor usage to stay within free tier limits or upgrade as needed.