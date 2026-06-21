import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { creatures } from '$lib/server/db/schema';
import { eq, desc, and, or, sql, inArray } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offsetParam = url.searchParams.get('offset');
    const currentOffset = offsetParam !== null ? parseInt(offsetParam, 10) : 20;
    
    const typeFilter = url.searchParams.get('type');
    const showDuplicates = url.searchParams.get('duplicates') === 'true';

    const queryUserId = url.searchParams.get('userId');
    const targetUserId = queryUserId ? queryUserId : locals.user.id;

    let conditions = [eq(creatures.userId, targetUserId)];

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
            .where(eq(creatures.userId, targetUserId))
            .groupBy(typeCombo)
            .having(sql`count(*) > 1`);

        conditions.push(inArray(typeCombo, duplicatesSubquery));
    }

    const nextCreatures = await db.query.creatures.findMany({
        where: and(...conditions),
        orderBy: [desc(creatures.hatchedAt)],
        limit: 20,
        offset: currentOffset
    });

    return json({ creatures: nextCreatures });
};