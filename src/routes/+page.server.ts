import { db } from '$lib/server/db';
import { creatures } from '$lib/server/db/schema';
import { eq, desc, and, or, sql, inArray } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const typeFilter = url.searchParams.get('type');
    const showDuplicates = url.searchParams.get('duplicates') === 'true';
    
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

    const userCreatures = await db.query.creatures.findMany({
        where: and(...conditions),
        orderBy: [desc(creatures.hatchedAt)],
        limit: 20 
    });

    return {
        creatures: userCreatures
    };
};