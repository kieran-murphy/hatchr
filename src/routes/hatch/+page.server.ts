import { db } from '$lib/server/db';
import { user as userTable, creatures } from '$lib/server/db/schema';
import { getRandomRarity, getRandomType } from '$lib/server/game';
import { eq, sql } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const load = async ({ locals }) => {
    if (!locals.user) throw redirect(302, '/login');

    const [userData] = await db
        .select({ gems: userTable.gems })
        .from(userTable)
        .where(eq(userTable.id, locals.user.id));

    return {
        userGems: userData?.gems ?? 0,
        userId: locals.user.id
    };
};

function getAuraStyle(rarity: string): string {
    switch(rarity.toUpperCase()) {
        case 'LEGENDARY': return 'blinding, glowing gold aura';
        case 'RARE': return 'crackling blue translucent aura';
        case 'UNCOMMON': return 'faint, mysterious green mist';
        default: return 'subtle, shadowy aura';
    }
}

export const actions = {
    default: async ({ locals }) => {
        const user = locals.user;
        if (!user) throw redirect(302, '/login');

        const HATCH_COST = 100;

        if (user.gems < HATCH_COST) {
            return fail(400, { message: "You're broke! Check your profile for gems." });
        }

        try {
            const result = await db.transaction(async (tx) => {
                
                await tx.update(userTable)
                    .set({ gems: sql`${userTable.gems} - ${HATCH_COST}` })
                    .where(eq(userTable.id, user.id));

                const rarity = getRandomRarity();
                const speciesName = getRandomType(rarity);
                
                const aura = getAuraStyle(rarity);
                const prompt = `A cute, cartoon style digital art of a ${speciesName} species creature. It features a ${aura}, and a ${speciesName}-related background. Make it a square image.`;

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
                    const errorData = await response.json().catch(() => null);
                    console.error("Gemini API Error:", errorData);
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

                const [newCreature] = await tx.insert(creatures).values({
                    userId: user.id,
                    speciesName,
                    rarity,
                    imageUrl: dbImagePath
                }).returning();

                return newCreature;
            });

            return { success: true, creature: result };
        } catch (error) {
            console.error('Hatching Error:', error);
            return fail(500, { message: "The egg refused to crack. Your gems have been refunded. Try again later!" });
        }
    }
};