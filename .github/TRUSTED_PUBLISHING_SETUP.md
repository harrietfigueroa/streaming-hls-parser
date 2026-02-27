# npm Trusted Publishing Setup (OIDC)

This repository uses **npm's Trusted Publishers** feature with OpenID Connect (OIDC) for secure, token-free publishing.

## What is Trusted Publishing?

Instead of using long-lived npm tokens, Trusted Publishing uses short-lived cryptographic credentials from GitHub Actions. This is more secure and eliminates the need to manage secrets.

## Benefits

✅ **No npm tokens** - No need to create or rotate tokens
✅ **Automatic provenance** - npm automatically generates provenance attestations
✅ **More secure** - Short-lived credentials that can't be exfiltrated
✅ **Simpler setup** - Just configure once on npmjs.com

## Setup Instructions

### Step 1: Configure on npmjs.com

1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Navigate to your package: `npmjs.com/package/streaming-hls-parser`
3. Click **Settings** tab
4. Find **Trusted Publishers** section
5. Click **Add a trusted publisher**
6. Enter these values:
   ```
   Provider: GitHub Actions
   Organization/User: harrietfigueroa
   Repository: streaming-hls-parser
   Workflow filename: publish.yml
   Environment name: (leave empty)
   ```
7. Click **Add**

### Step 2: Verify Workflow Configuration

The workflow is already configured correctly with:

```yaml
permissions:
  id-token: write  # Required for OIDC
  contents: write  # Required for release assets

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: '24'  # npm >=11.5.1 required
      registry-url: 'https://registry.npmjs.org'

  - name: Publish to npm
    run: npm publish --provenance --access public
    # No NODE_AUTH_TOKEN needed!
```

### Step 3: Test

Create a GitHub Release and the workflow will automatically publish to npm using trusted publishing.

## Requirements

- **Node.js 24+** (includes npm 11.5.1+)
- **Cloud-hosted GitHub runners** (self-hosted not yet supported)
- **Package configured on npmjs.com** as described above

## Troubleshooting

### Authentication fails

**Error:** `npm error code ENEEDAUTH`

**Solution:** Make sure you've configured the Trusted Publisher on npmjs.com with the exact workflow filename: `publish.yml`

### First publish of a new package

If this is the first time publishing the package, you'll need to publish manually once:

```bash
npm login
npm publish --access public
```

Then configure Trusted Publishing for future releases.

### Checking if it's configured

You can verify Trusted Publishing is set up by:

1. Go to npmjs.com/package/streaming-hls-parser
2. Click Settings tab
3. Look for "Trusted Publishers" section
4. Should see: `harrietfigueroa/streaming-hls-parser (publish.yml)`

## Migration from Classic Tokens

If you previously used `NPM_TOKEN`:

1. Configure Trusted Publishing as described above
2. Test with a release
3. Once working, delete the `NPM_TOKEN` secret from GitHub
4. Revoke the classic token from npmjs.com

**Note:** npm deprecated all Classic Tokens on December 9, 2025. Trusted Publishing is the recommended approach.

## Links

- [npm Trusted Publishers Documentation](https://docs.npmjs.com/trusted-publishers/)
- [GitHub Changelog Announcement](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)
