import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { creatures } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offsetParam = url.searchParams.get('offset');
    const currentOffset = offsetParam ? parseInt(offsetParam, 10) : 20;

    const nextCreatures = await db.query.creatures.findMany({
        where: eq(creatures.userId, locals.user.id),
        orderBy: [desc(creatures.hatchedAt)],
        limit: 20,
        offset: currentOffset
    });

    return json({ creatures: nextCreatures });
};