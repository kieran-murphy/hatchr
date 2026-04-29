import { db } from '$lib/server/db';
import { creatures, user as userTable } from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.user) throw redirect(302, '/login');

    const creature = await db.query.creatures.findFirst({
        where: eq(creatures.id, params.id)
    });

    if (!creature) throw error(404, 'Creature not found');

    return { creature };
};

export const actions: Actions = {
    release: async ({ params, locals }) => {
        const session = locals.user;
        if (!session) throw redirect(302, '/login');

        const RELEASE_REWARD = 5;

        try {
            await db.transaction(async (tx) => {
                const result = await tx.delete(creatures)
                    .where(and(
                        eq(creatures.id, params.id),
                        eq(creatures.userId, session.id)
                    ))
                    .returning();

                if (result.length === 0) throw new Error("Unauthorized");

                await tx.update(userTable)
                    .set({ gems: sql`${userTable.gems} + ${RELEASE_REWARD}` })
                    .where(eq(userTable.id, session.id));
            });
        } catch (e) {
            return fail(500, { message: "Could not release creature." });
        }
        
        throw redirect(303, '/');
    }
};