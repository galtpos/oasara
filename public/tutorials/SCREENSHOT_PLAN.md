# Wallet Education Tutorial Screenshot Plan

Per Educational Advisory Board guidance (Coughlin, Norman, Clark, Ive):
- Every click needs a screenshot
- Red circles/arrows on action areas
- Cropped to relevant UI
- Step numbers overlaid

---

## 01_why_patient (Conceptual - No UI Screenshots)
**Type**: Infographic/diagram only
**Screenshots**: 1 (existing is fine - conceptual)

---

## 02_why_provider (Conceptual - No UI Screenshots)
**Type**: Infographic/diagram only
**Screenshots**: 1 (existing is fine - conceptual)

---

## 03_download (5 Screenshots)
**Source**: zano.org/downloads

| # | Filename | Description | Annotation |
|---|----------|-------------|------------|
| 1 | 01_navigate.png | Browser showing zano.org | Arrow to URL bar |
| 2 | 02_downloads_page.png | Downloads page full view | Circle on "Downloads" nav |
| 3 | 03_choose_os.png | OS selection buttons | Circle on user's OS button |
| 4 | 04_download_started.png | Download initiated | Arrow to download indicator |
| 5 | 05_file_ready.png | Downloaded file | Circle on .exe/.dmg file |

---

## 04_watch_me (8 Screenshots)
**Source**: Zano desktop wallet (needs actual wallet or docs)

| # | Filename | Description | Annotation |
|---|----------|-------------|------------|
| 1 | 01_launch_installer.png | Double-click installer | Circle on installer icon |
| 2 | 02_install_wizard.png | Installation wizard | Circle on "Next" button |
| 3 | 03_install_progress.png | Installing... | Progress bar highlighted |
| 4 | 04_install_complete.png | Installation done | Circle on "Finish" |
| 5 | 05_first_launch.png | Wallet first screen | Full wallet window |
| 6 | 06_create_new.png | Create wallet option | Circle on "Create new wallet" |
| 7 | 07_wallet_name.png | Name your wallet | Circle on text field |
| 8 | 08_wallet_ready.png | Wallet main screen | Overview with arrows |

---

## 05_create_wallet (10 Screenshots) - CRITICAL
**Source**: Zano wallet create flow

| # | Filename | Description | Annotation |
|---|----------|-------------|------------|
| 1 | 01_create_button.png | Create new wallet button | Large red circle |
| 2 | 02_wallet_name.png | Enter wallet name | Arrow to field |
| 3 | 03_password.png | Create password | Arrow to password fields |
| 4 | 04_confirm_password.png | Confirm password | Checkmark shown |
| 5 | 05_recovery_warning.png | Recovery words warning | RED ALERT styling |
| 6 | 06_recovery_words.png | 24 recovery words | BLUR for privacy, circle "Write these down" |
| 7 | 07_paper_pencil.png | Physical paper/pencil | Photo of handwriting |
| 8 | 08_verify_words.png | Confirm recovery words | Circle on verification |
| 9 | 09_verification_success.png | Words verified | Green checkmark |
| 10 | 10_wallet_created.png | Wallet ready | Celebration styling |

---

## 06_get_send (8 Screenshots)
**Source**: Zano wallet transactions

| # | Filename | Description | Annotation |
|---|----------|-------------|------------|
| 1 | 01_receive_tab.png | Click Receive | Circle on Receive button |
| 2 | 02_your_address.png | Wallet address shown | Circle on address, "Copy" |
| 3 | 03_qr_code.png | QR code displayed | Arrow to QR |
| 4 | 04_send_tab.png | Click Send | Circle on Send button |
| 5 | 05_paste_address.png | Paste recipient | Arrow to address field |
| 6 | 06_enter_amount.png | Enter amount | Circle on amount field |
| 7 | 07_confirm_send.png | Confirm transaction | Circle on Confirm |
| 8 | 08_sent_success.png | Transaction complete | Green success message |

---

## 07_accept_payments (5 Screenshots)
**Source**: Provider workflow

| # | Filename | Description | Annotation |
|---|----------|-------------|------------|
| 1 | 01_receive_setup.png | Provider receive address | Circle on address |
| 2 | 02_share_qr.png | QR code for patients | Arrow to print/share |
| 3 | 03_payment_incoming.png | Notification received | Alert highlight |
| 4 | 04_payment_confirmed.png | Payment complete | Balance updated |
| 5 | 05_transaction_history.png | View history | Circle on history tab |

---

## Capture Sources

### Web (Playwright MCP can capture):
- zano.org/downloads (03_download)
- docs.zano.org/docs/use/gui-wallet (wallet UI mockups)
- docs.zano.org/docs/use/getting-started (transaction guides)

### Desktop App (Need manual or from docs):
- Wallet installation wizard
- Wallet creation flow
- Recovery words screen
- Send/receive UI

### Strategy:
1. Capture all web sources with Playwright MCP
2. Extract wallet UI screenshots from Zano documentation images
3. Annotate all images with red circles/arrows/step numbers
