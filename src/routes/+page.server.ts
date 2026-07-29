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
            type2: true,
            isFavorite: true
        }
    });

    const typeCounts: Record<string, number> = { 'All': allUserCreatures.length };
    const AVAILABLE_TYPES = ['Arcane', 'Cosmic', 'Crystal', 'Dark', 'Dragon', 'Electric', 'Fire', 'Ghost', 'Grass', 'Ground', 'Ice', 'Steel', 'Poison', 'Psychic', 'Water'];

    AVAILABLE_TYPES.forEach(t => {
        typeCounts[t] = 0;
    });

    allUserCreatures.forEach(c => {
        if (c.type1 && typeCounts[c.type1] !== undefined) typeCounts[c.type1]++;
        if (c.type2 && typeCounts[c.type2] !== undefined) typeCounts[c.type2]++;
    });

    // Mirrors the bulkRelease action's dedup logic so the "Sell All Duplicates"
    // estimate matches what will actually be released and rewarded. A favorite
    // covers the "keeper" slot for its combo, so every non-favorite in that
    // combo is sellable; otherwise one non-favorite is kept as the keeper.
    const comboGroups = new Map<string, { nonFavoriteCount: number, hasFavorite: boolean, hasType2: boolean }>();
    allUserCreatures.forEach(c => {
        const types = c.type2 ? [c.type1, c.type2] : [c.type1];
        const comboKey = types.sort().join('-');
        const existing = comboGroups.get(comboKey);
        if (existing) {
            if (c.isFavorite) existing.hasFavorite = true;
            else existing.nonFavoriteCount++;
        } else {
            comboGroups.set(comboKey, {
                nonFavoriteCount: c.isFavorite ? 0 : 1,
                hasFavorite: c.isFavorite ?? false,
                hasType2: !!c.type2
            });
        }
    });

    let duplicateCount = 0;
    let duplicateGems = 0;
    comboGroups.forEach(({ nonFavoriteCount, hasFavorite, hasType2 }) => {
        const sellable = hasFavorite ? nonFavoriteCount : Math.max(nonFavoriteCount - 1, 0);
        duplicateCount += sellable;
        duplicateGems += sellable * (hasType2 ? 100 : 50);
    });

    return {
        creatures: userCreatures,
        typeCounts: typeCounts,
        duplicateSummary: { count: duplicateCount, gems: duplicateGems }
    };
};

export const actions: Actions = {
    bulkRelease: async ({ locals }) => {
        if (!locals.user) throw redirect(302, '/login');

        const allCreatures = await db.query.creatures.findMany({
            where: eq(creatures.userId, locals.user.id),
            orderBy: [asc(creatures.hatchedAt)]
        });

        // A favorite covers the "keeper" slot for its combo, so every
        // non-favorite in that combo is sellable; otherwise the earliest
        // non-favorite is kept and the rest are sellable.
        const seenCombos = new Set<string>();
        const favoriteCombos = new Set<string>();
        allCreatures.forEach(c => {
            if (!c.isFavorite) return;
            const types = c.type2 ? [c.type1, c.type2] : [c.type1];
            favoriteCombos.add(types.sort().join('-'));
        });

        const idsToDelete: string[] = [];
        let totalGemsReward = 0;

        for (const creature of allCreatures) {
            if (creature.isFavorite) continue;

            const types = [creature.type1];
            if (creature.type2) types.push(creature.type2);
            const comboKey = types.sort().join('-');

            if (!favoriteCombos.has(comboKey) && !seenCombos.has(comboKey)) {
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