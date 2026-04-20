import { db } from '$lib/server/db';
import { creatures } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getRandomRarity, getRandomType } from '$lib/server/game';

export const actions: Actions = {
    default: async ({ locals }) => {
        const user = locals.user;
        if (!user) {
            return fail(401, { message: 'You must be logged in to hatch an egg!' });
        }

        const rarity = getRandomRarity(); 
        const speciesName = getRandomType(rarity);

        const sampleCreature = {
            userId: user.id,
            speciesName: speciesName,
            rarity: rarity,
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