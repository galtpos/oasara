# Cloudflare R2 Setup (Future)

**Status:** NOT IMPLEMENTED - Using Supabase Storage for now
**Documented:** January 4, 2026

---

## Why R2?

Cloudflare R2 offers:
- **Zero egress fees** (Supabase charges for bandwidth)
- **10GB/month free tier**
- **S3-compatible API**
- **Built-in CDN**

For high-volume scraped media, R2 is cheaper at scale.

---

## Current Setup

We're using **Supabase Storage** (`scraped-media` bucket):
- Already configured
- Works with existing auth
- Good enough for initial scraping

---

## R2 Setup Steps (When Ready)

### 1. Enable R2 in Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Login to: `ardventures@gmail.com`
3. Navigate to: Storage & databases → R2 object storage
4. Click "Get Started" and add payment method
   - **Cost:** $0.00 upfront, 10GB/month free
   - Only charged if exceeding free tier

### 2. Create Bucket

```bash
# After R2 is enabled:
npx wrangler r2 bucket create oasara-scraped-media
```

### 3. Create API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Create token with "R2 Token" template
3. Copy the Access Key ID and Secret Access Key

### 4. Update Environment Variables

Add to `scrapers/.env`:

```env
# Cloudflare R2
R2_ACCOUNT_ID=802511b1ef3d587214000536439e78b7
R2_ACCESS_KEY_ID=<your-access-key-id>
R2_SECRET_ACCESS_KEY=<your-secret-access-key>
R2_BUCKET_NAME=oasara-scraped-media
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

### 5. Enable Public Access

```bash
# Make bucket public for direct file access
npx wrangler r2 bucket update oasara-scraped-media --public
```

### 6. Update Storage Client

In `scrapers/utils/storage.py`, re-enable R2 client:

```python
# Uncomment and configure R2 client
self.r2 = boto3.client(
    's3',
    endpoint_url=f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
    aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
    region_name='auto'
)
```

---

## Pricing Reference

| Metric | Free Tier | Paid |
|--------|-----------|------|
| Storage | 10GB/month | $0.015/GB |
| Class A ops (write) | 1M/month | $4.50/million |
| Class B ops (read) | 10M/month | $0.36/million |
| **Egress** | **UNLIMITED** | **$0** |

---

## Related Files

- `scrapers/utils/storage.py` - Storage client (currently Supabase-only)
- `scrapers/.env.example` - Environment variable template
- `_advisors/OASARA_COMMUNITY_PLATFORM_BOARD.md` - Full Phase 3 spec

