import { db } from '$lib/server/db';
import { user as userTable, creatures, creatureQueue, dualCreatureQueue } from '$lib/server/db/schema';
import { eq, sql, asc, and, or, isNull } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { maintainCreatureQueue, maintainDualCreatureQueue, generateTargetedCreature } from '$lib/server/generation';

export const load = async ({ locals }) => {
    if (!locals.user) throw redirect(302, '/login');

    const [userData] = await db
        .select({ gems: userTable.gems, lastNewHatchClaimedAt: userTable.lastNewHatchClaimedAt })
        .from(userTable)
        .where(eq(userTable.id, locals.user.id));

    return {
        userGems: userData?.gems ?? 0,
        userId: locals.user.id,
        lastNewHatchClaimedAt: userData?.lastNewHatchClaimedAt || null
    };
};

export const actions = {
    // 1. Standard Hatching (Queue-based)
    hatchRegular: async ({ locals, request }) => {
        const user = locals.user;
        if (!user) throw redirect(302, '/login');

        const formData = await request.formData();
        const isDual = formData.get('tier') === 'dual';
        const HATCH_COST = isDual ? 200 : 100;
        const targetQueue = isDual ? dualCreatureQueue : creatureQueue;

        if (user.gems < HATCH_COST) return fail(400, { success: false, message: `You need ${HATCH_COST} gems!` });

        try {
            const [queuedCreature] = await db.select().from(targetQueue).orderBy(asc(targetQueue.queuedAt)).limit(1);
            if (!queuedCreature) return fail(503, { success: false, message: "Incubator empty! Please wait." });

            const result = await db.transaction(async (tx) => {
                await tx.update(userTable).set({ gems: sql`${userTable.gems} - ${HATCH_COST}` }).where(eq(userTable.id, user.id));
                await tx.delete(targetQueue).where(eq(targetQueue.id, queuedCreature.id));

                const newT1 = queuedCreature.type1;
                const newT2 = 'type2' in queuedCreature ? queuedCreature.type2 : null;

                const existing = await tx.select().from(creatures).where(
                    and(
                        eq(creatures.userId, user.id),
                        newT2 ? or(
                            and(eq(creatures.type1, newT1), eq(creatures.type2, newT2)),
                            and(eq(creatures.type1, newT2), eq(creatures.type2, newT1))
                        ) : and(eq(creatures.type1, newT1), isNull(creatures.type2))
                    )
                ).limit(1);
                
                const [newCreature] = await tx.insert(creatures).values({
                    userId: user.id,
                    speciesName: queuedCreature.speciesName,
                    description: queuedCreature.description,
                    rarity: queuedCreature.rarity,
                    imageUrl: queuedCreature.imageUrl,
                    type1: newT1,
                    type2: newT2
                }).returning();

                return { creature: newCreature, isNewCombo: existing.length === 0 };
            });

            if (isDual) Promise.resolve().then(maintainDualCreatureQueue).catch(console.error);
            else Promise.resolve().then(maintainCreatureQueue).catch(console.error);

            return { success: true, creature: result.creature, isNewCombo: result.isNewCombo };
        } catch (error) {
            console.error(error);
            return fail(500, { success: false, message: "The egg refused to crack. Try again later!" });
        }
    },

    // 2. New "Master Hatch" (On-demand, guaranteed new type combination)
    hatchNew: async ({ locals }) => {
        const session = locals.user;
        if (!session) throw redirect(302, '/login');

        // 1. Fetch user and their cooldown timestamp from the DB
        const currentUser = await db.query.user.findFirst({
            where: eq(userTable.id, session.id),
            columns: { gems: true, lastNewHatchClaimedAt: true }
        });

        if (!currentUser) return fail(401, { message: "User not found" });

        // 2. Security Check: Enforce Cooldown on the server
        const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
        const lastClaimed = currentUser.lastNewHatchClaimedAt?.getTime() || 0;
        
        if (Date.now() - lastClaimed < COOLDOWN_MS) {
            return fail(400, { success: false, message: "Too early! Come back tomorrow." });
        }

        // 3. Gem validation
        if (currentUser.gems < 1000) {
            return fail(400, { success: false, message: 'Not enough gems!' });
        }

        // 4. ---> THIS WAS MISSING: Find the unowned combinations! <---
        const userCollection = await db.select({ t1: creatures.type1, t2: creatures.type2 })
            .from(creatures)
            .where(eq(creatures.userId, session.id));
        
        const ownedCombos = new Set(userCollection.map(c => c.t2 ? [c.t1, c.t2].sort().join('-') : `${c.t1}-${c.t1}`));

        const TYPES = ['Arcane', 'Cosmic', 'Crystal', 'Dark', 'Dragon', 'Electric', 'Fire', 'Ghost', 'Grass', 'Ground', 'Ice', 'Steel', 'Poison', 'Psychic', 'Water'];
        const allPossible = [];
        for (let i = 0; i < TYPES.length; i++) {
            for (let j = i; j < TYPES.length; j++) {
                allPossible.push(`${TYPES[i]}-${TYPES[j]}`);
            }
        }

        const missing = allPossible.filter(c => !ownedCombos.has(c));
        if (missing.length === 0) return fail(400, { success: false, message: 'Collection complete!' });

        // Pick a random missing combo and split it into t1 and t2
        const [t1, t2] = missing[Math.floor(Math.random() * missing.length)].split('-');


        // 5. Perform the hatch
        try {
            return await db.transaction(async (tx) => {
                // Update Gems and the Timestamp
                await tx.update(userTable)
                    .set({ 
                        gems: sql`${userTable.gems} - 1000`,
                        lastNewHatchClaimedAt: new Date() // Reset the clock!
                    })
                    .where(eq(userTable.id, session.id));
                
                // Now t1 and t2 exist for the generator to use!
                const data = await generateTargetedCreature(t1, t2 !== t1 ? t2 : null);
                const [inserted] = await tx.insert(creatures).values({
                    userId: session.id,
                    ...data
                }).returning();

                return { success: true, creature: inserted, isNewCombo: true };
            });
        } catch (error) {
            console.error(error);
            return fail(500, { success: false, message: "Generation failed." });
        }
    }
};
