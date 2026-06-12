import { db } from '$lib/server/db';
import { creatureQueue, dualCreatureQueue } from '$lib/server/db/schema';
import { TYPE_RARITY_MAP, rarityWeight, type Rarity } from '$lib/server/game';
import { env } from '$env/dynamic/private';
import { count } from 'drizzle-orm';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';

const AVAILABLE_TYPES = Object.keys(TYPE_RARITY_MAP);
const QUEUE_TARGET = 10;

let isGeneratingSingle = false;
let isGeneratingDual = false;

function selectRandomTypes(amount: number) {
    const shuffled = [...AVAILABLE_TYPES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, amount);
}

function getAuraStyle(rarity: string): string {
    switch(rarity.toUpperCase()) {
        case 'LEGENDARY': return 'blinding, glowing gold aura, and a';
        case 'RARE': return 'crackling blue translucent aura, and a';
        case 'UNCOMMON': return '';
        default: return '';
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
        // Add this line to see the real reason in your terminal
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API Error Details:', JSON.stringify(errorData, null, 2));
        throw new Error(`Failed to generate AI image: ${response.statusText}`); 
    }

    if (!response.ok) throw new Error('Failed to generate AI image'); 

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

    const imageUrl = await generateAndSaveImage(prompt);

    return {
        id: randomUUID(),
        // Using faker for the name, stored in speciesName
        speciesName: faker.person.firstName(), 
        description: faker.commerce.productDescription(),
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