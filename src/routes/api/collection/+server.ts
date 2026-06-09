import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { creatures } from '$lib/server/db/schema';
import { eq, desc, and, or } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offsetParam = url.searchParams.get('offset');
    const currentOffset = offsetParam !== null ? parseInt(offsetParam, 10) : 20;
    const typeFilter = url.searchParams.get('type');

    let whereClause = eq(creatures.userId, locals.user.id);

    if (typeFilter && typeFilter !== 'All') {
        whereClause = and(
            eq(creatures.userId, locals.user.id),
            or(
                eq(creatures.type1, typeFilter),
                eq(creatures.type2, typeFilter)
            )
        );
    }

    const nextCreatures = await db.query.creatures.findMany({
        where: whereClause,
        orderBy: [desc(creatures.hatchedAt)],
        limit: 20,
        offset: currentOffset
    });

    return json({ creatures: nextCreatures });
};