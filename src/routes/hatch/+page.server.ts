import { db } from '$lib/server/db';
import { creatures } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ locals }) => {
        const user = locals.user;
        if (!user) {
            return fail(401, { message: 'You must be logged in to hatch an egg!' });
        }

        const sampleCreature = {
            userId: user.id,
            speciesName: "Mystery Blob",
            rarity: "COMMON" as const,
            imageUrl: "https://via.placeholder.com/150", // Placeholder for now
        };

        try {
            await db.insert(creatures).values(sampleCreature);
            return { success: true };
        } catch (error) {
            console.error(error);
            return fail(500, { message: 'Failed to hatch creature.' });
        }
    }
};