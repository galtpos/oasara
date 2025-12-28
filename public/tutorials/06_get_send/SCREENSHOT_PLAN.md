# Video 06: Get & Send Your First Freedom Dollars

## Reference Video Analysis
Source: ZanoList "How to Buy & Sell fUSD on Mobile" (70 seconds)
- Simple swap demonstration
- Missing: Receive address, Send to others, Faucet claim

## Our Video Improvements
Target Duration: 4:00 (per WALLET_EDUCATION_LAUNCH.md spec)
- Add receive workflow
- Add send to another wallet
- Show Oasara faucet claim (for education completers)
- Better pacing with narration

---

## Screenshot Capture Plan (12 screenshots)

### Section 1: Your Wallet Dashboard (2 screenshots)
1. **01_wallet_overview.png** - Main wallet screen showing:
   - ZANO balance (with $ value)
   - fUSD balance (Freedom Dollars)
   - Send / Receive / Swap buttons at bottom

2. **02_receive_address.png** - Receive screen showing:
   - Your wallet address (QR code)
   - "Copy Address" button
   - Explanation: "This is YOUR address - share it to receive funds"

### Section 2: Connect to Freedom Dollar Swap (3 screenshots)
3. **03_browser_icon.png** - Wallet home with browser icon highlighted
   - Shows where to tap to open Zano browser

4. **04_freedomdollar_url.png** - Browser address bar with:
   - freedomdollar.com/swap typed in
   - Keyboard visible

5. **05_connect_wallet.png** - Swap page showing:
   - "Connect your Zano Wallet" button
   - Oasara branding visible

### Section 3: Buy fUSD (Swap ZANO → fUSD) (3 screenshots)
6. **06_swap_interface.png** - Main swap screen showing:
   - Direction: ZANO → fUSD
   - Amount input field
   - Current exchange rate

7. **07_enter_amount.png** - Entering swap amount:
   - Amount: 0.5 ZANO
   - Shows fUSD you'll receive (~5 fUSD)
   - "Swap" button

8. **08_swap_success.png** - Success confirmation:
   - "Swap Completed Successfully!"
   - Transaction hash visible
   - New balances shown

### Section 4: Send fUSD to Someone (4 screenshots)
9. **09_send_button.png** - Back in wallet, "Send" button highlighted

10. **10_paste_address.png** - Send screen showing:
    - Recipient address field (paste or scan QR)
    - Amount field: 5 fUSD
    - "Send" button

11. **11_confirm_send.png** - Confirmation dialog:
    - "Send 5 fUSD to [address]?"
    - Fee displayed
    - Confirm / Cancel buttons

12. **12_send_complete.png** - Success screen:
    - "Transaction Sent!"
    - "Your payment is on its way"
    - Transaction details link

---

## Narration Script Outline

### Intro (15 seconds)
"Now that your wallet is set up, let's get some Freedom Dollars and make your first transaction."

### Receive Address (20 seconds)
"First, know your receive address. Tap 'Receive' to see your unique address and QR code. Anyone can send you funds here - it's completely private."

### Getting fUSD (60 seconds)
"To get Freedom Dollars, open the built-in browser and go to freedomdollar.com/swap. Connect your wallet, then swap some ZANO for fUSD. Enter the amount, confirm, and you'll see the fUSD in your wallet within seconds."

### Sending fUSD (60 seconds)
"Sending is just as easy. Tap 'Send', paste the recipient's address or scan their QR code, enter the amount, and confirm. That's it - private, instant, no chargebacks."

### Oasara Integration (45 seconds)
"On Oasara, you can pay for medical procedures using fUSD. Just copy your receive address, and your provider will send you an invoice. Pay directly from your wallet - no intermediaries, no frozen funds, no questions asked."

### Outro (20 seconds)
"Congratulations! You're now financially sovereign. Your money, your rules."

---

## ADB Capture Commands

```bash
# Screenshot sequence
adb shell screencap -p /sdcard/screenshot.png && adb pull /sdcard/screenshot.png 01_wallet_overview.png

# After each action, capture the next screenshot
# See video 05 automation for full ADB workflow
```

---

## Key Differences from ZanoList Video

| Aspect | ZanoList | Ours |
|--------|----------|------|
| Duration | 70 sec | 4 min |
| Receive flow | Missing | Included |
| Send to others | Missing | Included |
| Narration | None | Aaron's voice |
| Branding | Generic | Oasara |
| Context | Crypto trading | Medical payments |

---

## Production Notes

1. Use same Android device as Video 05 (Pixel/Samsung)
2. Have test wallet with ~1 ZANO for swap demonstration
3. Have second wallet address ready for send demo
4. Capture at 1080x1920 (vertical) for consistency
5. Add Oasara title card (5 sec) at start
