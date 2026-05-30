import { db } from '$lib/server/db';
import { creatureQueue } from '$lib/server/db/schema';
import { getRandomRarity, getRandomType } from '$lib/server/game';
import { env } from '$env/dynamic/private';
import { count } from 'drizzle-orm';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

let isGenerating = false;

function getAuraStyle(rarity: string): string {
    switch(rarity.toUpperCase()) {
        case 'LEGENDARY': return 'blinding, glowing gold aura';
        case 'RARE': return 'crackling blue translucent aura';
        case 'UNCOMMON': return 'faint, mysterious green mist';
        default: return 'subtle, shadowy aura';
    }
}

async function generateSingleCreature() {
    const rarity = getRandomRarity();
    const speciesName = getRandomType(rarity);
    const aura = getAuraStyle(rarity);
    
    const prompt = `A cute, cartoon style digital art of a ${speciesName} species creature. It features a ${aura}, and a ${speciesName}-related background. No words on the image and make it a square image.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["image"] }
        })
    });

    if (!response.ok) {
        throw new Error('Failed to generate AI image'); 
    }

    const data = await response.json();
    const base64Data = data.candidates[0].content.parts[0].inlineData.data;
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `${randomUUID()}.png`;
    const uploadDir = path.join(process.cwd(), 'static', 'uploads', 'creatures');
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const dbImagePath = `/uploads/creatures/${fileName}`;

    await db.insert(creatureQueue).values({
        id: randomUUID(),
        speciesName,
        imageUrl: dbImagePath,
        rarity
    });
}

export async function maintainCreatureQueue() {
    if (isGenerating) {
        console.log("Incubator is already running. Skipping duplicate trigger.");
        return;
    }

    isGenerating = true;

    try {
        const [{ value: currentCount }] = await db.select({ value: count() }).from(creatureQueue);
        
        const TARGET_BUFFER = 6;
        const needed = TARGET_BUFFER - currentCount;

        if (needed <= 0) return;

        console.log(`Queue at ${currentCount}/${TARGET_BUFFER}. Generating ${needed} new creatures...`);

        for (let i = 0; i < needed; i++) {
            try {
                await generateSingleCreature();
                console.log(`Generated queued creature ${i + 1} of ${needed}`);
            } catch (error) {
                console.error("Failed background generation:", error);
                break; 
            }
        }
    } finally {
        isGenerating = false;
    }
}