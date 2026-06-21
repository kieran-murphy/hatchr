import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db'; 
import { user, creatures } from '$lib/server/db/schema'; 
import { eq, desc } from 'drizzle-orm';

export const load = async ({ params }) => {
    const targetUserId = params.id;

    const profileUser = await db.query.user.findFirst({
        where: eq(user.id, targetUserId),
        columns: {
            id: true,
            name: true,
        }
    });

    if (!profileUser) {
        error(404, 'Trainer not found in the database.');
    }

    const targetCreatures = await db.query.creatures.findMany({
        where: eq(creatures.userId, targetUserId),
        orderBy: [desc(creatures.hatchedAt)], 
        limit: 20
    });

    return {
        profileUser,
        creatures: targetCreatures
    };
};