import { db } from '$lib/server/db';
import { user as userTable, creatures, creatureQueue } from '$lib/server/db/schema';
import { eq, sql, asc } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { maintainCreatureQueue } from '$lib/server/generation';

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

export const actions = {
    default: async ({ locals }) => {
        const user = locals.user;
        if (!user) throw redirect(302, '/login');

        const HATCH_COST = 100;

        if (user.gems < HATCH_COST) {
            return fail(400, { message: "You're broke! Check your profile for gems." });
        }

        try {
            const [queuedCreature] = await db
                .select()
                .from(creatureQueue)
                .orderBy(asc(creatureQueue.queuedAt))
                .limit(1);

            if (!queuedCreature) {
                return fail(503, { message: "Incubator warming up! Try again in 5 seconds." });
            }

            const result = await db.transaction(async (tx) => {
                await tx.update(userTable)
                    .set({ gems: sql`${userTable.gems} - ${HATCH_COST}` })
                    .where(eq(userTable.id, user.id));

                await tx.delete(creatureQueue).where(eq(creatureQueue.id, queuedCreature.id));

                const [newCreature] = await tx.insert(creatures).values({
                    userId: user.id,
                    speciesName: queuedCreature.speciesName,
                    rarity: queuedCreature.rarity,
                    imageUrl: queuedCreature.imageUrl
                }).returning();

                return newCreature;
            });

            Promise.resolve().then(() => maintainCreatureQueue()).catch(console.error);

            return { success: true, creature: result };
        } catch (error) {
            console.error(error);
            return fail(500, { message: "The egg refused to crack. Your gems have been refunded. Try again later!" });
        }
    }
};