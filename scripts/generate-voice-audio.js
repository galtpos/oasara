#!/usr/bin/env node
/**
 * Generate Voice Audio for Wallet Education Tutorials
 * Uses ElevenLabs API with Clone-Aaron voice
 */

const fs = require('fs');
const path = require('path');

const ELEVENLABS_API_KEY = 'sk_da406ed856cdba13fcc7e5f930bd978c1a881d4a879efeb7';
const CLONE_AARON_VOICE_ID = 'M6oEvUpBhSG4JJLf2QJu';
const TUTORIALS_DIR = path.join(__dirname, '../public/tutorials');

const TUTORIALS = [
  '01_why_patient',
  '02_why_provider',
  '03_download',
  '04_watch_me',
  '05_create_wallet',
  '06_get_send',
  '07_accept_payments'
];

async function generateAudio(text, outputPath) {
  console.log(`  Generating audio (${text.length} chars)...`);

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${CLONE_AARON_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${errorText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
  console.log(`  ✓ Saved: ${outputPath}`);

  return buffer.byteLength;
}

function extractNarration(scriptContent) {
  // Remove header lines (VIDEO X:, Duration:, Voice:, ---)
  const lines = scriptContent.split('\n');
  const contentStart = lines.findIndex(line => line.trim() === '---');

  if (contentStart === -1) {
    return scriptContent;
  }

  // Get everything after the --- separator
  const narration = lines.slice(contentStart + 1).join('\n').trim();
  return narration;
}

async function main() {
  console.log('=== Wallet Education Voice Generation ===\n');
  console.log(`Voice ID: ${CLONE_AARON_VOICE_ID} (Clone-Aaron)`);
  console.log(`Tutorials: ${TUTORIALS.length}\n`);

  let totalBytes = 0;
  let successCount = 0;

  for (const tutorial of TUTORIALS) {
    const scriptPath = path.join(TUTORIALS_DIR, tutorial, 'script.txt');
    const audioPath = path.join(TUTORIALS_DIR, tutorial, 'audio', 'narration.mp3');

    console.log(`\n[${tutorial}]`);

    if (!fs.existsSync(scriptPath)) {
      console.log(`  ⚠ Script not found: ${scriptPath}`);
      continue;
    }

    try {
      const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
      const narration = extractNarration(scriptContent);

      console.log(`  Script: ${narration.length} characters`);

      // Create audio directory if needed
      const audioDir = path.dirname(audioPath);
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      const bytes = await generateAudio(narration, audioPath);
      totalBytes += bytes;
      successCount++;

      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
    }
  }

  console.log('\n=== Generation Complete ===');
  console.log(`Success: ${successCount}/${TUTORIALS.length}`);
  console.log(`Total audio size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
