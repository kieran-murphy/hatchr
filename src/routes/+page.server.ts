import { db } from '$lib/server/db';
import { creatures } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const userCreatures = await db.query.creatures.findMany({
        where: eq(creatures.userId, locals.user.id),
        orderBy: [desc(creatures.hatchedAt)]
    });

    return {
        creatures: userCreatures
    };
};