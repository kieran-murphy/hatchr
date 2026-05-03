import { db } from '$lib/server/db';
import { creatures, user as userTable } from '$lib/server/db/schema';
import { eq, and, sql, count } from 'drizzle-orm';
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

        const RELEASE_REWARD = 50;

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
    },

    toggleFavorite: async ({ params, locals, request }) => {
        const session = locals.user;
        if (!session) throw redirect(302, '/login');

        const formData = await request.formData();
        const isCurrentlyFavorite = formData.get('isFavorite') === 'true';

        if (!isCurrentlyFavorite) {
            const favorites = await db.select({ value: count() })
                .from(creatures)
                .where(and(eq(creatures.userId, session.id), eq(creatures.isFavorite, true)));

            if (favorites[0].value >= 4) {
                return fail(400, { message: "Your Top 4 slots are full! Unfavorite one first." });
            }
        }

        await db.update(creatures)
            .set({ isFavorite: !isCurrentlyFavorite })
            .where(and(eq(creatures.id, params.id), eq(creatures.userId, session.id)));

        return { success: true };
    }
};