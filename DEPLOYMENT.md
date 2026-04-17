# PokéTracker Deployment Guide

## Deploy to Vercel

### Quick Deploy

1. **Install Vercel CLI** (if not installed):
```bash
npm install -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel --prod
```

### Troubleshooting Images

If images don't load on Vercel:

1. **Check browser console** - Visit `test-sprites.html` on your deployed site to see which images fail
2. **Verify paths** - All images should use absolute paths starting with `/sprites/`
3. **Check deployment** - Ensure `sprites/` folder is included in deployment (not in .gitignore)

### Files Updated for Deployment

- `vercel.json` - Vercel configuration with proper headers
- `.vercelignore` - Excludes unnecessary files from deployment
- All image paths use absolute paths (`/sprites/...`)
- Added debug logging for image load failures

### Testing Locally

After deploying, test with:
```bash
# Visit test page
https://your-app.vercel.app/test-sprites.html
```

If you see the Poké Ball images, sprites are working correctly.
