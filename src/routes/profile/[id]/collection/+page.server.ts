import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db'; // Adjust path to your db instance
import { user, creatures } from '$lib/server/db/schema'; // Adjust path to your schema
import { eq, desc } from 'drizzle-orm';

export const load = async ({ params }) => {
    const targetUserId = params.id;

    // 1. Fetch the target user to get their name and verify they exist
    const profileUser = await db.query.user.findFirst({
        where: eq(user.id, targetUserId),
        columns: {
            id: true,
            name: true, // Assuming 'username' or 'displayName' based on your search logic
        }
    });

    if (!profileUser) {
        error(404, 'Trainer not found in the database.');
    }

    // 2. Fetch all creatures linked to this specific user
    const targetCreatures = await db.query.creatures.findMany({
        where: eq(creatures.userId, targetUserId),
        orderBy: [desc(creatures.hatchedAt)] // Default sort by most recent
    });

    return {
        profileUser,
        creatures: targetCreatures
    };
};