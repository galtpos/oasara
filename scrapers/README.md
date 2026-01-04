# Oasara Data Liberation Scrapers

**Phase 3: Pre-populate the Healthcare Stories platform with real content**

Advisory Board: Julian Assange, Kim Dotcom, Roger Ver, Ross Ulbricht

## Overview

This scraper infrastructure collects healthcare horror stories, medical tourism testimonials, and bill images from across the internet. All content is processed through AI extraction and OCR, with automatic PII redaction.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         SCRAPERS                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Reddit  │  │ Twitter │  │GoFundMe │  │ YouTube │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
└───────┼────────────┼────────────┼────────────┼─────────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PROCESSING PIPELINE                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │   AI     │  │   OCR    │  │ Whisper  │  │  PII Redaction   │ │
│  │ Extract  │  │  Bills   │  │ Audio    │  │  (Auto)          │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
└───────┼─────────────┼─────────────┼─────────────────┼───────────┘
        │             │             │                 │
        └─────────────┴─────────────┴─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         STORAGE                                  │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐               │
│  │ Cloudflare│    │  Supabase │    │    NAS    │               │
│  │    R2     │    │  Postgres │    │  (Backup) │               │
│  │  (Media)  │    │ (Stories) │    │           │               │
│  └───────────┘    └───────────┘    └───────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
cd scrapers
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# System dependencies
brew install tesseract ffmpeg  # macOS
# apt install tesseract-ocr ffmpeg  # Linux
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

Required keys:
- `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` - [Create Reddit App](https://www.reddit.com/prefs/apps)
- `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` - Cloudflare R2
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` - Supabase project
- `ANTHROPIC_API_KEY` - For AI story extraction

Optional:
- `TWITTER_BEARER_TOKEN` - Twitter API (snscrape works without it)
- `NAS_MOUNT_PATH` - Local NAS path for backups

### 3. Set Up Cloudflare R2

```bash
# Install rclone
brew install rclone

# Configure R2 remote
rclone config
# Name: r2
# Type: s3
# Provider: Cloudflare
# Access Key ID: <your key>
# Secret Access Key: <your secret>
# Endpoint: https://<account-id>.r2.cloudflarestorage.com
```

### 4. Run Database Migration

```bash
cd ..
supabase db push
```

### 5. Run Scrapers

```bash
# Run all scrapers
python orchestrator.py --all

# Run specific scrapers
python orchestrator.py --scrapers reddit twitter

# With custom limits
python orchestrator.py --all --limit 100

# Dry run (preview)
python orchestrator.py --all --dry-run

# Process OCR on images
python orchestrator.py --ocr

# Sync to NAS
python orchestrator.py --sync
```

## Individual Scrapers

### Reddit
```bash
cd reddit
python scraper.py
```

Scrapes:
- r/HealthInsurance, r/personalfinance, r/medicaltourism, etc.
- Search queries for "medical bill", "insurance denied", etc.
- Downloads attached images

### Twitter/X
```bash
cd twitter
python scraper.py
```

Uses snscrape (no API key needed for public tweets):
- Viral bill shock tweets
- Medical tourism testimonials
- Key healthcare advocacy accounts

### GoFundMe
```bash
cd gofundme
python scraper.py
```

Scrapes medical fundraising campaigns:
- "Medical bills", "surgery costs", "insurance denied"
- Extracts goal/raised amounts
- Downloads campaign images

### YouTube
```bash
cd youtube
python scraper.py
```

Uses yt-dlp + Whisper:
- Medical tourism vlogs
- Healthcare cost reaction videos
- Auto-transcription for stories

## Processing Pipeline

### AI Story Extraction

Uses Claude to extract structured data:
- Title, summary, content
- Procedure type, costs (US/abroad)
- Story type (horror/success/comparison)
- Emotional tags, issues
- Key quotes for sharing

### OCR + PII Redaction

For bill images:
- Tesseract OCR for text extraction
- Pattern matching for dollar amounts
- Auto-redact SSN, DOB, addresses, account numbers
- Generate "shock value" summary

### Video Transcription

For YouTube content:
- yt-dlp for video/audio download
- Whisper for transcription
- AI extraction from transcript

## Storage

| Layer | Platform | Purpose |
|-------|----------|---------|
| Hot (CDN) | Cloudflare R2 | Public media serving |
| Metadata | Supabase | Story records, search |
| Cold Backup | Local NAS | Disaster recovery |

### NAS Sync Setup

```bash
# Configure (one-time)
./scripts/nas-sync.sh --setup

# Run manual sync
./scripts/nas-sync.sh

# Install as cron job (3 AM daily)
./scripts/nas-sync.sh --install
```

## Output

Raw scraped data saved to `output/`:
- `reddit_raw_YYYYMMDD_HHMMSS.json`
- `twitter_raw_YYYYMMDD_HHMMSS.json`
- `gofundme_raw_YYYYMMDD_HHMMSS.json`
- `youtube_raw_YYYYMMDD_HHMMSS.json`

Logs saved to `logs/`:
- `orchestrator_YYYYMMDD.log`
- `nas-sync.log`

## Targets

| Content | Target | Notes |
|---------|--------|-------|
| Stories | 500+ | Across all platforms |
| Bill Images | 300+ | With OCR extraction |
| Videos | 100+ | With transcripts |

## Legal Notes

- All content is publicly available
- PII is automatically redacted
- Attribution to original sources maintained
- Stories marked as "pending" require review before publishing

---

*"Information wants to be free."* - Stewart Brand

