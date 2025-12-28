#!/usr/bin/env python3
"""
Zano Wallet Tutorial Video Creator
Uses ElevenLabs (Aaron Day voice) + ffmpeg to create final video with captions.
"""

import os
import json
import base64
import subprocess
import requests
from pathlib import Path

# Configuration
ELEVENLABS_API_KEY = "sk_da406ed856cdba13fcc7e5f930bd978c1a881d4a879efeb7"
AARON_VOICE_ID = "M6oEvUpBhSG4JJLf2QJu"
MODEL_ID = "eleven_multilingual_v2"

BASE_DIR = Path("/Users/aaronday/Documents/medicaltourism/oasara-marketplace/public/tutorials/05_create_wallet")
ANNOTATED_DIR = BASE_DIR / "annotated"
AUDIO_DIR = BASE_DIR / "audio"
OUTPUT_DIR = BASE_DIR / "output"

# Narration segments - text for each step
NARRATION = {
    "intro": """Have you ever wished you had a bank account that no government could freeze, no corporation could spy on, and no inflation could erode? Well, you're about to create one. In the next few minutes, I'll walk you through setting up your very own Zano privacy wallet. Don't worry - if you can use a smartphone, you can do this. Let's get started.""",

    "step_01": """First things first - you need to create a PIN code. Think of this like the combination to a safe. Pick four numbers that you'll remember, but here's the important part: don't use your birthday. That's the first thing anyone trying to break in would guess. Your anniversary might work... assuming you remember it. I won't judge.""",

    "step_02": """Now type those same four numbers again. Yes, we're asking you to do something you just did. It's annoying, but it catches typos. Trust the process.""",

    "step_03": """Welcome to your wallet home screen. Right now it's empty - like a new house before you move in. See that 'Add Wallet' button at the bottom? That's where we're headed. Tap it.""",

    "step_04": """Time to name your wallet. Think of it like naming a savings account. 'Vacation Fund,' 'Emergency Cash,' 'Freedom Money' - whatever speaks to you. Pro tip: Don't name it 'My Life Savings.' Let's not make it easy for the bad guys.""",

    "step_05": """Now we're adding a password. 'Wait,' you might say, 'didn't I just create a PIN?' Yes, you did. This is double protection. The PIN opens the app. The password opens this specific wallet. Two locks are better than one. Write this password down somewhere safe - not on a sticky note on your monitor. And if you forget this password? Don't panic. Those 25 words we're about to create can restore everything. The password just protects this specific device.""",

    "step_06": """You've filled out all the paperwork. Now tap 'Create new Wallet' at the bottom. It's like signing the closing documents on a house, except way less stressful and no one's asking for your firstborn as a down payment.""",

    "step_07": """Okay, pause. I need you to actually stop and listen to this part. What you're about to see is the single most important thing in this entire process. It's called your recovery phrase - 25 words that ARE your wallet. Before you tap that button, I need you to grab a pen and paper. Not later. Not 'I'll remember it.' Right now. Seriously. I'll wait. Go get that pen. Got it? Good. Let's continue.""",

    "step_08": """Here they are. Twenty-five random words. They look meaningless, but these words ARE your wallet. Let me explain what that means. If you lose your phone tomorrow, these 25 words let you restore your entire wallet on a new device. Every coin. Every transaction. Everything. But here's the flip side - and this is critical - if someone else gets these words, they get your money. All of it. Gone. No bank to call. No fraud department. No reversing the transaction. Take your time here. There's no timer. This is your money we're protecting. So write them down. Check them twice. Not sure your handwriting is right? Tap 'Copy' first, paste into a notes app, then verify what you wrote matches. Then hide them like your grandmother hid her secret recipes - somewhere only you know about. Never, ever share these words with anyone. Not tech support. Not your bank. Not even if someone claiming to be from Zano asks for them. We will never ask. Anyone who does is trying to rob you.""",

    "step_09": """And just like that - you did it! You now have a private digital wallet that you, and only you, control. No bank can freeze it. No government can seize it. No corporation is tracking every purchase. Welcome to financial freedom. No suit and tie required.""",

    "step_10": """This is your wallet dashboard. Think of it like your bank account summary page. Your balance is up top - zero for now, but that's about to change. Below you'll see buttons for the things you'll do most: Send money out, Receive money in. Simple as that. Let's look at those next.""",

    "step_11": """Want someone to send you money? Tap 'Receive' and you'll see this screen. That big square is a QR code - it's like your mailing address in scannable form. Here's the good news: this address is completely safe to share. It's public, like your email address. People can send money TO you using this, but they can't take money FROM you. Think of it like giving someone your P.O. Box number, not your house keys.""",

    "step_12": """When you're ready to send money to someone else, tap 'Send.' You'll enter their wallet address - that long string of letters and numbers - and the amount. One very important warning: triple-check that address before you hit send. Unlike that embarrassing email you sent to the wrong person, crypto transactions cannot be unsent. Cannot be reversed. Cannot be undone. Copy and paste addresses whenever possible. Don't try to type them manually. Your fingers will thank you, and so will your wallet. And if you do make a mistake? Your only hope is to contact the person who received it and ask them nicely to send it back. They're the only ones who can. So... don't make mistakes. Check three times.""",

    "outro": """That's it. You've just set up your first privacy wallet. You now have something most people don't - a financial tool that actually belongs to you. Remember: guard those 25 words like your life depends on it. Because your financial freedom does. For more tutorials on using your new wallet - sending, receiving, and keeping your funds secure - check out the other guides in this series. You just took your financial future into your own hands. That's not nothing. That's everything. Welcome aboard."""
}

# Map segments to images
SEGMENT_IMAGES = {
    "intro": None,  # Black screen or title card
    "step_01": "step_01_01_enter_pin.png",
    "step_02": "step_02_02_confirm_pin.png",
    "step_03": "step_03_03_wallet_options.png",
    "step_04": "step_04_04_create_wallet_form.png",
    "step_05": "step_05_05_wallet_name_entered.png",
    "step_06": "step_06_06_form_filled.png",
    "step_07": "step_07_07_recovery_info.png",
    "step_08": "step_08_08_seed_phrase.png",
    "step_09": "step_09_09_wallet_created.png",
    "step_10": "step_10_10_wallet_dashboard.png",
    "step_11": "step_11_11_receive_screen.png",
    "step_12": "step_12_12_send_screen.png",
    "outro": None,  # Black screen or end card
}


def text_to_speech(text: str, output_path: Path, voice_id: str = AARON_VOICE_ID) -> bool:
    """Generate speech using ElevenLabs API."""
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }

    data = {
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": {
            "stability": 0.6,
            "similarity_boost": 0.85,
            "style": 0.4,  # More expressive for tutorial
        }
    }

    print(f"  Generating audio: {output_path.name}...")

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        return True
    else:
        print(f"  ERROR: {response.status_code} - {response.text}")
        return False


def get_audio_duration(audio_path: Path) -> float:
    """Get duration of audio file in seconds."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(audio_path)],
        capture_output=True, text=True
    )
    return float(result.stdout.strip())


def create_title_card(output_path: Path, text: str, duration: float):
    """Create a title card video segment."""
    subprocess.run([
        "ffmpeg", "-y", "-f", "lavfi",
        "-i", f"color=c=0x0a1628:s=1080x2400:d={duration}",
        "-vf", f"drawtext=text='{text}':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2:font=Helvetica",
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        str(output_path)
    ], capture_output=True)


def create_segment_video(image_path: Path, audio_path: Path, output_path: Path):
    """Create a video segment from image + audio."""
    duration = get_audio_duration(audio_path)

    subprocess.run([
        "ffmpeg", "-y",
        "-loop", "1", "-i", str(image_path),
        "-i", str(audio_path),
        "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-t", str(duration),
        "-shortest",
        str(output_path)
    ], capture_output=True)


def concatenate_videos(video_list: list, output_path: Path):
    """Concatenate multiple videos into one."""
    # Create concat file
    concat_file = output_path.parent / "concat_list.txt"
    with open(concat_file, 'w') as f:
        for video in video_list:
            f.write(f"file '{video}'\n")

    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_file),
        "-c", "copy",
        str(output_path)
    ], capture_output=True)

    concat_file.unlink()  # Clean up


def generate_srt_captions(segments_info: list, output_path: Path):
    """Generate SRT caption file from segments."""
    srt_content = []
    caption_num = 1
    current_time = 0.0

    for segment_id, duration, text in segments_info:
        # Split text into caption chunks (roughly 10 words each)
        words = text.split()
        chunks = []
        current_chunk = []

        for word in words:
            current_chunk.append(word)
            if len(current_chunk) >= 10 or word.endswith('.') or word.endswith('?') or word.endswith('!'):
                chunks.append(' '.join(current_chunk))
                current_chunk = []

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        # Calculate time per chunk
        if chunks:
            time_per_chunk = duration / len(chunks)

            for chunk in chunks:
                start_time = current_time
                end_time = current_time + time_per_chunk

                # Format timestamps
                start_str = format_srt_time(start_time)
                end_str = format_srt_time(end_time)

                srt_content.append(f"{caption_num}")
                srt_content.append(f"{start_str} --> {end_str}")
                srt_content.append(chunk)
                srt_content.append("")

                caption_num += 1
                current_time = end_time
        else:
            current_time += duration

    with open(output_path, 'w') as f:
        f.write('\n'.join(srt_content))


def format_srt_time(seconds: float) -> str:
    """Format seconds to SRT timestamp format."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def main():
    print("\n🎬 Zano Wallet Tutorial Video Creator")
    print("=" * 50)
    print(f"Voice: Aaron Day ({AARON_VOICE_ID})")
    print("=" * 50)

    # Create directories
    AUDIO_DIR.mkdir(exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Step 1: Generate all audio segments
    print("\n📢 Step 1: Generating Audio (ElevenLabs)")
    print("-" * 40)

    for segment_id, text in NARRATION.items():
        audio_path = AUDIO_DIR / f"{segment_id}.mp3"
        if not audio_path.exists():
            success = text_to_speech(text, audio_path)
            if not success:
                print(f"  FAILED: {segment_id}")
                return
        else:
            print(f"  Skipping (exists): {segment_id}.mp3")

    print("\n✅ All audio generated!")

    # Step 2: Create video segments
    print("\n🎞️ Step 2: Creating Video Segments")
    print("-" * 40)

    segment_videos = []
    segments_info = []  # For captions

    for segment_id in NARRATION.keys():
        audio_path = AUDIO_DIR / f"{segment_id}.mp3"
        video_path = OUTPUT_DIR / f"{segment_id}.mp4"
        image_file = SEGMENT_IMAGES.get(segment_id)

        duration = get_audio_duration(audio_path)
        segments_info.append((segment_id, duration, NARRATION[segment_id]))

        if image_file:
            image_path = ANNOTATED_DIR / image_file
            if image_path.exists():
                print(f"  Creating: {segment_id}.mp4 ({duration:.1f}s)")
                create_segment_video(image_path, audio_path, video_path)
                segment_videos.append(video_path)
            else:
                print(f"  WARNING: Missing image {image_file}")
        else:
            # Create title/end card
            title_text = "Creating Your First\\nZano Privacy Wallet" if segment_id == "intro" else "Thank You\\nfor Watching"
            print(f"  Creating title card: {segment_id}.mp4 ({duration:.1f}s)")

            # For intro/outro, create video with audio
            temp_video = OUTPUT_DIR / f"{segment_id}_temp.mp4"
            create_title_card(temp_video, title_text, duration)

            # Add audio
            subprocess.run([
                "ffmpeg", "-y",
                "-i", str(temp_video),
                "-i", str(audio_path),
                "-c:v", "copy", "-c:a", "aac",
                "-shortest",
                str(video_path)
            ], capture_output=True)
            temp_video.unlink()
            segment_videos.append(video_path)

    # Step 3: Concatenate all segments
    print("\n🔗 Step 3: Combining Segments")
    print("-" * 40)

    final_video = OUTPUT_DIR / "zano_wallet_tutorial.mp4"
    concatenate_videos(segment_videos, final_video)
    print(f"  Created: {final_video.name}")

    # Step 4: Generate captions
    print("\n📝 Step 4: Generating Captions")
    print("-" * 40)

    srt_path = OUTPUT_DIR / "zano_wallet_tutorial.srt"
    generate_srt_captions(segments_info, srt_path)
    print(f"  Created: {srt_path.name}")

    # Step 5: Burn in captions (optional)
    print("\n🔥 Step 5: Creating Captioned Version")
    print("-" * 40)

    captioned_video = OUTPUT_DIR / "zano_wallet_tutorial_captioned.mp4"
    subprocess.run([
        "ffmpeg", "-y",
        "-i", str(final_video),
        "-vf", f"subtitles={srt_path}:force_style='FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,MarginV=50'",
        "-c:a", "copy",
        str(captioned_video)
    ], capture_output=True)
    print(f"  Created: {captioned_video.name}")

    # Calculate total duration
    total_duration = sum(get_audio_duration(AUDIO_DIR / f"{s}.mp3") for s in NARRATION.keys())

    print("\n" + "=" * 50)
    print("✅ VIDEO CREATION COMPLETE!")
    print("=" * 50)
    print(f"\n📁 Output Directory: {OUTPUT_DIR}")
    print(f"🎬 Final Video: zano_wallet_tutorial.mp4")
    print(f"🎬 Captioned: zano_wallet_tutorial_captioned.mp4")
    print(f"📝 Captions: zano_wallet_tutorial.srt")
    print(f"⏱️ Total Duration: {total_duration/60:.1f} minutes")
    print(f"\n🎙️ Voice: Aaron Day (ElevenLabs)")


if __name__ == "__main__":
    main()
