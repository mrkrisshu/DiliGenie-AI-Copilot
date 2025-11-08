# Jarvis AI Assistant - Deployment Checklist

## Pre-Deployment

- [ ] All API keys configured in `.env`
- [ ] Sample documents ingested to Pinecone
- [ ] Tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in development mode

## Vercel Deployment

### First-Time Setup

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Link Project**:

   ```bash
   vercel link
   ```

   - Select or create project
   - Link to Git repository (optional)

4. **Configure Environment Variables**:

   Go to Vercel Dashboard → Your Project → Settings → Environment Variables

   Add the following (copy from your local `.env`):

   - `OPENROUTER_API_KEY`
   - `OPENROUTER_API_URL`
   - `OPENROUTER_MODEL`
   - `OPENROUTER_ENABLE_STREAMING`
   - `PINECONE_API_KEY`
   - `PINECONE_ENVIRONMENT`
   - `PINECONE_INDEX_NAME`
   - `PINECONE_DIMENSION`
   - `MAX_TOKENS`
   - `TEMPERATURE`
   - `TOKEN_BUDGET_WARNING`
   - `ENABLE_CACHE`
   - `CACHE_TTL_SECONDS`
   - `TOP_K_RESULTS`
   - `CONVERSATION_HISTORY_LENGTH`
   - `DATABASE_TYPE`
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_AUTHOR_NAME`
   - `NEXT_PUBLIC_GITHUB_URL`
   - `NEXT_PUBLIC_LINKEDIN_URL`
   - `NEXT_PUBLIC_DEMO_VIDEO_URL` (optional)
   - `WEATHER_API_KEY` (optional)
   - `NEWS_API_KEY` (optional)

### Deploy

5. **Deploy to Production**:

   ```bash
   vercel --prod
   ```

6. **Verify Deployment**:
   - Open the deployment URL
   - Test chat functionality
   - Test document upload
   - Check dashboard widgets
   - Try voice input

### Post-Deployment

- [ ] Test chat with sample questions
- [ ] Upload a test document and query it
- [ ] Check Knowledge Space
- [ ] Verify command palette works
- [ ] Test dark mode toggle
- [ ] Check About modal displays correctly
- [ ] Monitor logs for errors

## GitHub Actions (CI/CD)

### Setup

1. **Add Secrets to GitHub**:

   Go to GitHub repo → Settings → Secrets and variables → Actions

   Add:

   - `VERCEL_TOKEN` (from [Vercel account tokens](https://vercel.com/account/tokens))
   - `VERCEL_ORG_ID` (from `.vercel/project.json` after `vercel link`)
   - `VERCEL_PROJECT_ID` (from `.vercel/project.json`)

2. **Enable Actions**:
   - Push code to `main` branch
   - GitHub Actions will automatically run tests and deploy

## Monitoring

### Check Deployment Health

```bash
# View logs
vercel logs <deployment-url>

# Check deployment status
vercel inspect <deployment-url>
```

### Cost Monitoring

- Monitor OpenRouter usage: https://openrouter.ai/activity
- Monitor Pinecone usage: https://app.pinecone.io/

### Performance

- Test response times
- Check Vercel analytics
- Monitor serverless function durations

## Troubleshooting

### Build Fails

- Check Node version (18+)
- Ensure all dependencies installed
- Review build logs in Vercel dashboard

### API Errors

- Verify environment variables in Vercel
- Check API key validity
- Review function logs

### Slow Responses

- Check Pinecone query performance
- Reduce `TOP_K_RESULTS`
- Enable/check caching

## Rollback

If deployment has issues:

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <previous-deployment-url>
```

## Demo URL

Once deployed, your app will be at:

```
https://your-project-name.vercel.app
```

Share this URL for demos!

---

**Last Updated**: November 6, 2024
**Project**: Jarvis AI Assistant
**Author**: Krishna Bantola
