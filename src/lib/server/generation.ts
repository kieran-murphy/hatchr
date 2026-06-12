import { db } from '$lib/server/db';
import { creatureQueue, dualCreatureQueue } from '$lib/server/db/schema';
import { TYPE_RARITY_MAP, rarityWeight, type Rarity } from '$lib/server/game';
import { env } from '$env/dynamic/private';
import { count } from 'drizzle-orm';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const AVAILABLE_TYPES = Object.keys(TYPE_RARITY_MAP);
const QUEUE_TARGET = 10;

let isGeneratingSingle = false;
let isGeneratingDual = false;

function selectRandomTypes(amount: number): string[] {
    const selectedTypes = new Set<string>();

    while (selectedTypes.size < amount) {
        // 1. Roll a number between 1 and 100
        const roll = Math.random() * 100;
        
        // 2. Determine which rarity tier won the roll
        let targetRarity = 'COMMON';
        if (roll > 60 && roll <= 85) targetRarity = 'UNCOMMON';
        if (roll > 85 && roll <= 96) targetRarity = 'RARE';
        if (roll > 96) targetRarity = 'LEGENDARY';

        // 3. Filter your available types to only those that match the winning rarity
        const eligibleTypes = AVAILABLE_TYPES.filter(type => 
            TYPE_RARITY_MAP[type] === targetRarity
        );

        // 4. Pick a random type from that specific rarity pool
        if (eligibleTypes.length > 0) {
            const randomEligibleType = eligibleTypes[Math.floor(Math.random() * eligibleTypes.length)];
            selectedTypes.add(randomEligibleType);
        }
    }

    return Array.from(selectedTypes);
}

function getAuraStyle(rarity: string): string {
    switch(rarity.toUpperCase()) {
        case 'LEGENDARY': return 'blinding, glowing gold aura, and a';
        case 'RARE': return 'crackling blue translucent aura, and a';
        case 'UNCOMMON': return '';
        default: return '';
    }
}

async function generateCreatureText(types: string[], rarity: string): Promise<{ name: string; description: string }> {
    const typeString = types.join(' and ');
    const prompt = `You are a creative assistant for a digital creature-collection game. 
    Generate a unique, catchy species name and a short, flavorful description (max 2 sentences) for a ${rarity} rarity creature that is a ${typeString} type.
    Return the result strictly as a JSON object with two keys: "name" and "description". Do not include markdown formatting.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
                responseMimeType: "application/json" // Forces Gemini to return pure JSON
            }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error('Failed to generate AI text:', errText);
        // Throw an error instead of returning a fallback
        throw new Error("Failed to generate text from Gemini API"); 
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    try {
        return JSON.parse(textResponse);
    } catch (e) {
        console.error("Failed to parse Gemini text response", textResponse);
        // Throw an error instead of returning a fallback
        throw new Error("Failed to parse JSON from Gemini text response"); 
    }
}

async function generateAndSaveImage(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["image"] }
        }),
        signal: AbortSignal.timeout(100000) 
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API Error Details:', JSON.stringify(errorData, null, 2));
        throw new Error(`Failed to generate AI image: ${response.statusText}`); 
    }

    const data = await response.json();
    const base64Data = data.candidates[0].content.parts[0].inlineData.data;
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `${randomUUID()}.png`;
    const uploadDir = path.join(process.cwd(), 'static', 'uploads', 'creatures');
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    return `/uploads/creatures/${fileName}`;
}

async function createCreatureData(isDual: boolean) {
    const types = selectRandomTypes(isDual ? 2 : 1);
    
    const rarity1 = TYPE_RARITY_MAP[types[0]];
    const rarity2 = isDual ? TYPE_RARITY_MAP[types[1]] : rarity1;
    
    const finalRarity: Rarity = rarityWeight[rarity1] >= rarityWeight[rarity2] ? rarity1 : rarity2;
    const aura = getAuraStyle(finalRarity);
    
    let prompt;
    if (isDual) {
        prompt = `A cute, cartoon style digital art of a creature that is a balanced fusion of ${types[0]} and ${types[1]} elemental energy. It features a ${aura} combined ${types[0]} and ${types[1]}-related background. No words on the image and make it a square image with no border.`;
    } else {
        prompt = `A cute, cartoon style digital art of a ${types[0]} type creature. It features a ${aura} ${types[0]}-related background. No words on the image and make it a square image with no border.`;
    }

    const [imageUrl, textData] = await Promise.all([
        generateAndSaveImage(prompt),
        generateCreatureText(types, finalRarity)
    ]);

    return {
        id: randomUUID(),
        speciesName: textData.name, 
        description: textData.description,
        imageUrl,
        rarity: finalRarity,
        type1: types[0],
        type2: isDual ? types[1] : null
    };
}

export async function maintainCreatureQueue() {
    if (isGeneratingSingle) return;
    isGeneratingSingle = true;

    try {
        const [{ value: currentCount }] = await db.select({ value: count() }).from(creatureQueue);
        const needed = QUEUE_TARGET - currentCount;

        if (needed > 0) {
            for (let i = 0; i < needed; i++) {
                try {
                    const data = await createCreatureData(false);
                    await db.insert(creatureQueue).values({
                        id: data.id,
                        speciesName: data.speciesName,
                        description: data.description,
                        imageUrl: data.imageUrl,
                        rarity: data.rarity,
                        type1: data.type1
                    });
                } catch (error) {
                    console.error('Error generating single creature:', error);
                }
            }
        }
    } finally {
        isGeneratingSingle = false;
    }
}

export async function maintainDualCreatureQueue() {
    if (isGeneratingDual) return;
    isGeneratingDual = true;

    try {
        const [{ value: currentCount }] = await db.select({ value: count() }).from(dualCreatureQueue);
        const needed = QUEUE_TARGET - currentCount;

        if (needed > 0) {
            for (let i = 0; i < needed; i++) {
                try {
                    const data = await createCreatureData(true);
                    await db.insert(dualCreatureQueue).values({
                        id: data.id,
                        speciesName: data.speciesName,
                        description: data.description,
                        imageUrl: data.imageUrl,
                        rarity: data.rarity,
                        type1: data.type1,
                        type2: data.type2 as string
                    });
                } catch (error) {
                    console.log('Error generating dual creature:', error);
                }
            }
        }
    } finally {
        isGeneratingDual = false;
    }
}