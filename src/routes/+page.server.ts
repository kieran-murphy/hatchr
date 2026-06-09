import { db } from '$lib/server/db';
import { creatures } from '$lib/server/db/schema';
import { eq, desc, and, or } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

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

    const userCreatures = await db.query.creatures.findMany({
        where: whereClause,
        orderBy: [desc(creatures.hatchedAt)],
        limit: 20 
    });

    return {
        creatures: userCreatures
    };
};