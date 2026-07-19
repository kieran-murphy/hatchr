import { db } from '$lib/server/db';
import { creatures, user as userTable } from '$lib/server/db/schema';
import { eq, desc, asc, and, or, sql, inArray } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const typeFilter = url.searchParams.get('type');
    const showDuplicates = url.searchParams.get('duplicates') === 'true';
    const showFavorites = url.searchParams.get('favorites') === 'true'; // <-- NEW
    const sortBy = url.searchParams.get('sort') || 'recent';
    
    const conditions = [eq(creatures.userId, locals.user.id)];

    if (typeFilter && typeFilter !== 'All') {
        conditions.push(
            or(
                eq(creatures.type1, typeFilter),
                eq(creatures.type2, typeFilter)
            )
        );
    }

    if (showDuplicates) {
        const typeCombo = sql`LEAST(${creatures.type1}, COALESCE(${creatures.type2}, ${creatures.type1})) || '-' || GREATEST(${creatures.type1}, COALESCE(${creatures.type2}, ${creatures.type1}))`;
        
        const duplicatesSubquery = db.select({ combo: typeCombo })
            .from(creatures)
            .where(eq(creatures.userId, locals.user.id))
            .groupBy(typeCombo)
            .having(sql`count(*) > 1`);

        conditions.push(inArray(typeCombo, duplicatesSubquery));
    }

    if (showFavorites) {
        conditions.push(eq(creatures.isFavorite, true));
    }

    let orderLogic = [desc(creatures.hatchedAt)];
    if (sortBy === 'alphabetical') {
        orderLogic = [asc(creatures.speciesName)];
    } else if (sortBy === 'rarity') {
        orderLogic = [
            desc(sql`CASE ${creatures.rarity} WHEN 'LEGENDARY' THEN 4 WHEN 'RARE' THEN 3 WHEN 'UNCOMMON' THEN 2 WHEN 'COMMON' THEN 1 ELSE 0 END`),
            desc(creatures.hatchedAt)
        ];
    }

    const userCreatures = await db.query.creatures.findMany({
        where: and(...conditions),
        orderBy: orderLogic,
        limit: 20 
    });

    const allUserCreatures = await db.query.creatures.findMany({
        where: eq(creatures.userId, locals.user.id),
        columns: {
            type1: true,
            type2: true
        }
    });

    const typeCounts: Record<string, number> = { 'All': allUserCreatures.length };
    const AVAILABLE_TYPES = ['Cosmic', 'Crystal', 'Dark', 'Dragon', 'Electric', 'Fire', 'Ghost', 'Grass', 'Ground', 'Ice', 'Poison', 'Psychic', 'Water'];

    AVAILABLE_TYPES.forEach(t => {
        typeCounts[t] = 0;
    });

    allUserCreatures.forEach(c => {
        if (c.type1 && typeCounts[c.type1] !== undefined) typeCounts[c.type1]++;
        if (c.type2 && typeCounts[c.type2] !== undefined) typeCounts[c.type2]++;
    });

    return {
        creatures: userCreatures,
        typeCounts: typeCounts
    };
};

export const actions: Actions = {
    bulkRelease: async ({ locals }) => {
        if (!locals.user) throw redirect(302, '/login');

        const allSafeCreatures = await db.query.creatures.findMany({
            where: and(
                eq(creatures.userId, locals.user.id),
                eq(creatures.isFavorite, false) 
            ),
            orderBy: [asc(creatures.hatchedAt)] 
        });

        const seenCombos = new Set<string>();
        const idsToDelete: string[] = [];
        let totalGemsReward = 0;

        for (const creature of allSafeCreatures) {
            const types = [creature.type1];
            if (creature.type2) types.push(creature.type2);
            const comboKey = types.sort().join('-');

            if (!seenCombos.has(comboKey)) {
                seenCombos.add(comboKey);
            } else {
                idsToDelete.push(creature.id);
                totalGemsReward += creature.type2 ? 100 : 50; 
            }
        }

        if (idsToDelete.length > 0) {
            await db.transaction(async (tx) => {
                await tx.delete(creatures)
                    .where(inArray(creatures.id, idsToDelete));
                
                await tx.update(userTable)
                    .set({ gems: sql`${userTable.gems} + ${totalGemsReward}` })
                    .where(eq(userTable.id, locals.user.id));
            });
        }

        return { 
            success: true, 
            releasedCount: idsToDelete.length, 
            gemsEarned: totalGemsReward 
        };
    }
};