#!/usr/bin/env python3
"""
Capture screenshots for Zano wallet education tutorials.
Requires: pip install playwright && playwright install chromium
"""

import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

BASE_PATH = Path("/Users/aaronday/Documents/medicaltourism/oasara-marketplace/public/tutorials")

SCREENSHOTS = [
    {
        "url": "https://zano.org/downloads",
        "path": BASE_PATH / "03_download/screenshots/01_download_page.png",
        "description": "Zano downloads page"
    },
    {
        "url": "https://zano.org",
        "path": BASE_PATH / "04_watch_me/screenshots/01_zano_home.png",
        "description": "Zano homepage"
    },
    {
        "url": "https://docs.zano.org/docs/use/gui-wallet",
        "path": BASE_PATH / "05_create_wallet/screenshots/01_wallet_guide.png",
        "description": "GUI wallet documentation"
    },
    {
        "url": "https://docs.zano.org/docs/use/getting-started",
        "path": BASE_PATH / "06_get_send/screenshots/01_getting_started.png",
        "description": "Getting started guide"
    },
    {
        "url": "https://zano.org/features",
        "path": BASE_PATH / "07_accept_payments/screenshots/01_features.png",
        "description": "Zano features page"
    },
    {
        "url": "https://oasara.com/why-zano",
        "path": BASE_PATH / "01_why_patient/screenshots/01_problem.png",
        "description": "Why Zano - Patient perspective"
    },
    {
        "url": "https://oasara.com/why-zano",
        "path": BASE_PATH / "02_why_provider/screenshots/01_benefits.png",
        "description": "Why Zano - Provider benefits"
    },
]

async def capture_screenshots():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=2  # Retina quality
        )
        page = await context.new_page()

        for item in SCREENSHOTS:
            print(f"Capturing: {item['description']}")
            print(f"  URL: {item['url']}")

            # Ensure directory exists
            item['path'].parent.mkdir(parents=True, exist_ok=True)

            try:
                await page.goto(item['url'], wait_until="networkidle", timeout=30000)
                await asyncio.sleep(1)  # Allow animations to settle
                await page.screenshot(path=str(item['path']), full_page=False)
                print(f"  Saved: {item['path']}")
            except Exception as e:
                print(f"  ERROR: {e}")

        await browser.close()
        print("\nAll screenshots captured!")

if __name__ == "__main__":
    asyncio.run(capture_screenshots())
