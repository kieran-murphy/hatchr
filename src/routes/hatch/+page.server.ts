import { db } from '$lib/server/db';
import { user as userTable, creatures } from '$lib/server/db/schema';
import { getRandomRarity, getRandomType } from '$lib/server/game';
import { eq, sql } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
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
        userGems: userData?.gems ?? 0
    };
};

export const actions = {
    default: async ({ locals }) => {
        const user = locals.user;
        if (!user) throw redirect(302, '/login');

        const HATCH_COST = 10;

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
                
                const aiUrl = `https://image.pollinations.ai/prompt/cute-pixel-art-${speciesName.replace(/\s+/g, '-')}-sprite`;

                const response = await fetch(aiUrl);
                if (!response.ok) throw new Error('Failed to fetch AI image');
                
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

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
            return fail(500, { message: "The egg refused to crack. Try again!" });
        }
    }
};