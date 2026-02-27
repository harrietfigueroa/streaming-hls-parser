# Publishing Guide

This repository uses GitHub Actions to automatically publish to npm and CDNs when you create a GitHub Release.

**This workflow uses npm's Trusted Publishers (OIDC)** - no npm tokens required!

## Prerequisites

### 1. Configure npm Trusted Publishing

You need to configure your npm package to trust this GitHub repository:

1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Navigate to your package page: `npmjs.com/package/streaming-hls-parser`
3. Click **Settings** tab
4. Scroll to **Trusted Publishers** section
5. Click **Add a trusted publisher**
6. Fill in the details:
   - **Provider**: GitHub Actions
   - **Organization/User**: `harrietfigueroa` (or your GitHub username)
   - **Repository**: `streaming-hls-parser`
   - **Workflow filename**: `publish.yml`
   - **Environment name**: Leave empty (optional)
7. Click **Add**

**That's it!** No npm tokens needed. The workflow authenticates using OpenID Connect (OIDC).

### 2. NPM Account Setup (First Time Only)

If this is your first publish, make sure you have access to the package name:

```bash
# Login to npm
npm login

# Check if package name is available (first time only)
npm search streaming-hls-parser

# Or claim the package if you're the owner
npm owner add YOUR_NPM_USERNAME streaming-hls-parser
```

### 3. Requirements

- **Node.js 24+** (workflow uses Node 24 for npm >=11.5.1 requirement)
- **GitHub repository** with cloud-hosted runners (not self-hosted)

## How to Publish a New Version

### Step 1: Prepare Your Changes

Make sure all your changes are committed and pushed to the `main` branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Step 2: Create a GitHub Release

1. Go to your GitHub repository
2. Click **Releases** (right sidebar)
3. Click **Create a new release**
4. Click **Choose a tag** dropdown
5. Type a new tag following semantic versioning (e.g., `v1.0.0`, `v1.0.1`, `v2.0.0`)
   - Use `v` prefix (e.g., `v1.0.0` not `1.0.0`)
   - Follow [Semantic Versioning](https://semver.org/):
     - `MAJOR.MINOR.PATCH`
     - Increment MAJOR for breaking changes
     - Increment MINOR for new features
     - Increment PATCH for bug fixes
6. Click **Create new tag: vX.X.X on publish**
7. Enter a **Release title** (e.g., "Release v1.0.0" or a descriptive title)
8. Write **Release notes** describing what's new/changed/fixed
9. Click **Publish release**

### Step 3: Wait for Automation

The GitHub Action will automatically:

1. ✅ Extract version from tag (removes `v` prefix)
2. ✅ Update `package.json` version
3. ✅ Install dependencies
4. ✅ Run all tests (443 tests)
5. ✅ Build TypeScript and browser bundle
6. ✅ Publish to npm with provenance
7. ✅ Upload browser bundle and source map to GitHub Release
8. ✅ Update release description with CDN links and installation instructions

You can monitor progress in the **Actions** tab.

### Step 4: Verify Publication

After the workflow completes (usually 2-3 minutes):

**NPM:**
```bash
npm view streaming-hls-parser@1.0.0
```

**CDN (wait 5-10 minutes for sync):**
- jsDelivr: https://cdn.jsdelivr.net/npm/streaming-hls-parser@1.0.0/dist/index.browser.js
- unpkg: https://unpkg.com/streaming-hls-parser@1.0.0/dist/index.browser.js

**GitHub Release:**
- Check release page for attached `index.browser.js` and `index.browser.js.map`

## Version Number Guidelines

### Semantic Versioning Examples

- `v0.1.0` → `v0.1.1` - Bug fixes, patch updates
- `v0.1.1` → `v0.2.0` - New features, backward compatible
- `v0.2.0` → `v1.0.0` - First stable release or breaking changes
- `v1.0.0` → `v1.1.0` - New features (backward compatible)
- `v1.1.0` → `v2.0.0` - Breaking changes

### Pre-release Versions

For beta/alpha releases, use tags like:
- `v1.0.0-alpha.1`
- `v1.0.0-beta.1`
- `v1.0.0-rc.1`

These will be published to npm with the appropriate dist-tag.

## Troubleshooting

### Workflow Fails at "Publish to npm"

**Error: `ENEEDAUTH` or authentication errors**
- You haven't configured Trusted Publishing on npmjs.com
- Follow the setup steps in Prerequisites section above
- Make sure the workflow filename matches exactly: `publish.yml`

**Error: `EPUBLISHCONFLICT`**
- Version already exists on npm
- Delete the GitHub Release and tag
- Create a new release with a higher version number

**Error: `E403`**
- You don't have permission to publish
- Make sure you're listed as an owner: `npm owner ls streaming-hls-parser`

### Workflow Fails at "Run tests"

- Fix the failing tests locally first
- Commit and push fixes
- Delete the failed release
- Create a new release

### CDN Links Don't Work

- CDNs take 5-10 minutes to sync after npm publish
- Check npm first: `npm view streaming-hls-parser`
- Try jsDelivr purge: https://www.jsdelivr.com/tools/purge
- Wait and try again

## Manual Publishing (Not Recommended)

If you need to publish manually without GitHub Actions:

```bash
# Build the package
npm run build

# Update version
npm version patch  # or minor, major

# Publish
npm publish --access public

# Create git tag
git push origin main --tags
```

## Rollback a Release

If you need to unpublish a version:

```bash
# Unpublish from npm (within 72 hours only)
npm unpublish streaming-hls-parser@1.0.0

# Delete GitHub release and tag
# Go to Releases → Click release → Delete release
# Then: git push --delete origin v1.0.0
```

**Warning:** Unpublishing is discouraged. Instead, publish a new patch version with the fix.
