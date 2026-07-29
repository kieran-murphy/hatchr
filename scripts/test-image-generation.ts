/**
 * Standalone playground for testing creature image generation prompts/models
 * without touching the DB or UploadThing. Generated images are saved locally
 * to scripts/generation-output/.
 *
 * Usage:
 *   npm run test:gen
 *   npm run test:gen -- "a cute cartoon dragon made of stained glass"
 *
 * Edit PROMPT and MODEL below to try new prompt wording, aura styles, or models.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// ---------------------------------------------------------------------------
// Editable test inputs — change these to try new generation methods
// ---------------------------------------------------------------------------

const PROMPT =
    process.argv[2] ??
    'A cute, cartoon style digital art of a Fire type creature. It features a crackling blue translucent aura, and a Fire-related background. No words on the image and make it a square image with no border.';

const MODEL = 'gemini-3.1-flash-image-preview';

// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, 'generation-output');

function loadEnv() {
    const envPath = resolve(__dirname, '..', '.env');
    if (!existsSync(envPath)) return;

    for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;

        const key = trimmed.slice(0, eqIndex).trim();
        let value = trimmed.slice(eqIndex + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        if (!(key in process.env)) process.env[key] = value;
    }
}

async function generateImage(prompt: string): Promise<Buffer> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing — check your .env file');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ['image'] }
        }),
        signal: AbortSignal.timeout(100_000)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API Error Details:', JSON.stringify(errorData, null, 2));
        throw new Error(`Failed to generate AI image: ${response.statusText}`);
    }

    const data = await response.json();
    const base64Data = data.candidates[0].content.parts[0].inlineData.data;
    return Buffer.from(base64Data, 'base64');
}

async function main() {
    loadEnv();

    console.log(`Model: ${MODEL}`);
    console.log(`Prompt: ${PROMPT}\n`);
    console.log('Generating image...');

    const rawBuffer = await generateImage(PROMPT);

    const optimizedBuffer = await sharp(rawBuffer)
        .resize(512, 512)
        .webp({ quality: 80 })
        .toBuffer();

    if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

    const filename = `${Date.now()}.webp`;
    const outputPath = resolve(OUTPUT_DIR, filename);
    writeFileSync(outputPath, optimizedBuffer);

    console.log(`\nSaved: ${outputPath}`);
}

main().catch((error) => {
    console.error('\nGeneration failed:', error);
    process.exit(1);
});
