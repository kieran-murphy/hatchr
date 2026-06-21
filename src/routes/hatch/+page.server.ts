import { db } from '$lib/server/db';
import { user as userTable, creatures, creatureQueue, dualCreatureQueue } from '$lib/server/db/schema';
import { eq, sql, asc, and, or, isNull } from 'drizzle-orm'; // <-- Added and, or, isNull
import { fail, redirect } from '@sveltejs/kit';
import { maintainCreatureQueue, maintainDualCreatureQueue } from '$lib/server/generation';

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
    default: async ({ locals, request }) => {
        const user = locals.user;
        if (!user) throw redirect(302, '/login');

        const formData = await request.formData();
        const isDual = formData.get('isDual') === 'true';
        const HATCH_COST = isDual ? 200 : 100;
        
        const targetQueue = isDual ? dualCreatureQueue : creatureQueue;

        if (user.gems < HATCH_COST) {
            return fail(400, { message: `You need ${HATCH_COST} gems for this hatch!` });
        }

        try {
            const [queuedCreature] = await db
                .select()
                .from(targetQueue)
                .orderBy(asc(targetQueue.queuedAt))
                .limit(1);

            if (!queuedCreature) {
                return fail(503, { message: "Incubator empty! Please wait a moment." });
            }

            const result = await db.transaction(async (tx) => {
                await tx.update(userTable)
                    .set({ gems: sql`${userTable.gems} - ${HATCH_COST}` })
                    .where(eq(userTable.id, user.id));

                await tx.delete(targetQueue).where(eq(targetQueue.id, queuedCreature.id));

                const newT1 = queuedCreature.type1;
                const newT2 = 'type2' in queuedCreature ? queuedCreature.type2 : null;

                let existingCombo;
                if (newT2) {
                    existingCombo = await tx.select().from(creatures).where(
                        and(
                            eq(creatures.userId, user.id),
                            or(
                                and(eq(creatures.type1, newT1), eq(creatures.type2, newT2)),
                                and(eq(creatures.type1, newT2), eq(creatures.type2, newT1))
                            )
                        )
                    ).limit(1);
                } else {
                    existingCombo = await tx.select().from(creatures).where(
                        and(
                            eq(creatures.userId, user.id),
                            eq(creatures.type1, newT1),
                            isNull(creatures.type2)
                        )
                    ).limit(1);
                }
                
                const isNewCombo = existingCombo.length === 0;

                const [newCreature] = await tx.insert(creatures).values({
                    userId: user.id,
                    speciesName: queuedCreature.speciesName,
                    description: queuedCreature.description,
                    rarity: queuedCreature.rarity,
                    imageUrl: queuedCreature.imageUrl,
                    type1: newT1,
                    type2: newT2
                }).returning();

                return { creature: newCreature, isNewCombo };
            });

            if (isDual) {
                Promise.resolve().then(() => maintainDualCreatureQueue()).catch(console.error);
            } else {
                Promise.resolve().then(() => maintainCreatureQueue()).catch(console.error);
            }

            return { success: true, creature: result.creature, isNewCombo: result.isNewCombo };
        } catch (error) {
            console.error(error);
            return fail(500, { message: "The egg refused to crack. Try again later!" });
        }
    }
};