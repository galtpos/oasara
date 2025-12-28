#!/usr/bin/env python3
"""
Zano Wallet Tutorial Screenshot Annotator
Educational Advisory Board Approved - Grandma-Friendly Edition

Advisors consulted:
- Joseph Coughlin (MIT AgeLab): Large fonts, real-world analogies
- Jony Ive: One message per screen, warm language
- Don Norman: Anticipate mistakes, protect the user
- Ruth Clark: Segment content, clear progression
- Paulo Freire: Explain WHY this matters for freedom
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Configuration
INPUT_DIR = "/Users/aaronday/Documents/medicaltourism/oasara-marketplace/public/tutorials/05_create_wallet/screenshots"
OUTPUT_DIR = "/Users/aaronday/Documents/medicaltourism/oasara-marketplace/public/tutorials/05_create_wallet/annotated"

# Try to find a good font, fall back to default
def get_font(size, bold=False):
    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except:
                continue
    return ImageFont.load_default()

# Annotation data for each screenshot
# Format: (filename, step_num, title, analogy, warning, humor)
ANNOTATIONS = [
    (
        "01_enter_pin.png",
        1,
        "Create Your Secret Code",
        "Think of this like the combination to a safe.\nOnly YOU should know these 4 numbers.",
        "Don't use your birthday - that's the first thing thieves guess!",
        "Pro tip: Your anniversary works... if you remember it."
    ),
    (
        "02_confirm_pin.png",
        2,
        "Type It Again (Just Making Sure!)",
        "Like when websites ask you to type your\npassword twice. It's annoying but smart.",
        None,
        "Yes, we know you just typed it. Humor us."
    ),
    (
        "03_wallet_options.png",
        3,
        "Your Wallet Home",
        "This is like a folder where all your\ndigital wallets will live. Empty for now!",
        None,
        "Time to fill it up. Tap 'Add Wallet' below."
    ),
    (
        "04_create_wallet_form.png",
        4,
        "Name Your New Wallet",
        "Like naming a new savings account.\n'Vacation Fund' or 'Rainy Day' works great.",
        None,
        "Don't name it 'My Life Savings' - keep thieves guessing!"
    ),
    (
        "05_wallet_name_entered.png",
        5,
        "Now Add a Password",
        "Double protection! PIN to open the app,\npassword to open THIS specific wallet.",
        "WRITE THIS PASSWORD DOWN somewhere safe!",
        "Two locks are better than one. Ask any paranoid person."
    ),
    (
        "06_form_filled.png",
        6,
        "Ready to Create!",
        "You've filled out the paperwork.\nNow tap the button to make it official.",
        None,
        "Like signing the mortgage, but way less stressful."
    ),
    (
        "07_recovery_info.png",
        7,
        "THE MOST IMPORTANT STEP",
        "What you're about to see is your\nMASTER BACKUP KEY to everything.",
        "STOP! Get a pen and paper RIGHT NOW.\nYou cannot come back to this screen!",
        "Seriously. We'll wait. Go get that pen."
    ),
    (
        "08_seed_phrase.png",
        8,
        "Your 25 Recovery Words",
        "These 25 words ARE your wallet.\nLose your phone? These words restore everything.\nSomeone steals these? They steal your money.",
        "NEVER share these words with ANYONE.\nNot tech support. Not your bank. Not even us.",
        "Write them down. Check twice. Hide them like grandma's secret recipe."
    ),
    (
        "09_wallet_created.png",
        9,
        "Congratulations! You Did It!",
        "Your wallet now exists! It's like having\na Swiss bank account in your pocket.",
        None,
        "Welcome to financial freedom. No suit required."
    ),
    (
        "10_wallet_dashboard.png",
        10,
        "Your Wallet Dashboard",
        "This is like your bank account summary.\nBalance on top, options below.",
        None,
        "Zero balance for now. That's about to change!"
    ),
    (
        "11_receive_screen.png",
        11,
        "How to Receive Money",
        "That QR code is like your mailing address.\nSafe to share! People scan it to send you funds.",
        "This is SAFE to share - it's your public address.",
        "Like giving someone your PO Box, not your house key."
    ),
    (
        "12_send_screen.png",
        12,
        "How to Send Money",
        "Like writing a check, but digital.\nEnter the address, amount, and hit send.",
        "TRIPLE-CHECK the address before sending!\nCrypto transactions cannot be reversed.",
        "Unlike that embarrassing email, you can't unsend this."
    ),
]

def create_annotated_image(input_path, output_path, step_num, title, analogy, warning, humor):
    """Create an annotated version of the screenshot."""

    # Open the original image
    img = Image.open(input_path)
    width, height = img.size

    # Calculate annotation panel height (add space at top)
    panel_height = 400 if warning else 320

    # Create new image with extra space for annotations
    new_height = height + panel_height
    annotated = Image.new('RGB', (width, new_height), color='#0a1628')

    # Paste original image below the annotation panel
    annotated.paste(img, (0, panel_height))

    # Create drawing context
    draw = ImageDraw.Draw(annotated)

    # Load fonts
    font_step = get_font(72, bold=True)
    font_title = get_font(42, bold=True)
    font_body = get_font(28)
    font_warning = get_font(26, bold=True)
    font_humor = get_font(24)

    # Colors
    COLOR_STEP = '#00d4ff'      # Bright cyan for step number
    COLOR_TITLE = '#ffffff'     # White for title
    COLOR_BODY = '#b8c5d6'      # Light gray-blue for body
    COLOR_WARNING = '#ff6b6b'   # Red for warnings
    COLOR_HUMOR = '#7ee8a0'     # Soft green for humor

    y_offset = 20

    # Draw step number circle
    circle_x = 60
    circle_y = y_offset + 40
    circle_radius = 45
    draw.ellipse(
        [circle_x - circle_radius, circle_y - circle_radius,
         circle_x + circle_radius, circle_y + circle_radius],
        outline=COLOR_STEP, width=4
    )

    # Draw step number
    step_text = str(step_num)
    bbox = draw.textbbox((0, 0), step_text, font=font_step)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    draw.text(
        (circle_x - text_width // 2, circle_y - text_height // 2 - 8),
        step_text, font=font_step, fill=COLOR_STEP
    )

    # Draw title
    title_x = 130
    draw.text((title_x, y_offset + 15), title, font=font_title, fill=COLOR_TITLE)

    y_offset += 100

    # Draw analogy (the grandma explanation)
    draw.text((40, y_offset), analogy, font=font_body, fill=COLOR_BODY)

    # Count lines in analogy for spacing
    analogy_lines = analogy.count('\n') + 1
    y_offset += analogy_lines * 36 + 20

    # Draw warning if present
    if warning:
        # Draw warning box
        warning_box_y = y_offset
        draw.rectangle(
            [30, warning_box_y, width - 30, warning_box_y + 80],
            outline=COLOR_WARNING, width=3
        )
        draw.text((50, warning_box_y + 10), "⚠️ " + warning.split('\n')[0], font=font_warning, fill=COLOR_WARNING)
        if '\n' in warning:
            draw.text((50, warning_box_y + 45), warning.split('\n')[1], font=font_warning, fill=COLOR_WARNING)
        y_offset += 100

    # Draw humor line
    if humor:
        draw.text((40, y_offset), f"💡 {humor}", font=font_humor, fill=COLOR_HUMOR)

    # Draw a subtle line separating annotation from screenshot
    draw.line([(0, panel_height - 2), (width, panel_height - 2)], fill='#1a3a5c', width=2)

    # Save annotated image
    annotated.save(output_path, 'PNG', quality=95)
    print(f"✓ Created: {os.path.basename(output_path)}")

def main():
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("\n🎨 Zano Wallet Tutorial Annotator")
    print("=" * 50)
    print("Creating grandma-friendly screenshots...\n")

    success_count = 0

    for filename, step, title, analogy, warning, humor in ANNOTATIONS:
        input_path = os.path.join(INPUT_DIR, filename)
        output_path = os.path.join(OUTPUT_DIR, f"step_{step:02d}_{filename}")

        if os.path.exists(input_path):
            try:
                create_annotated_image(input_path, output_path, step, title, analogy, warning, humor)
                success_count += 1
            except Exception as e:
                print(f"✗ Error processing {filename}: {e}")
        else:
            print(f"⚠ Missing: {filename}")

    print(f"\n✅ Annotated {success_count}/{len(ANNOTATIONS)} screenshots")
    print(f"📁 Output: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
