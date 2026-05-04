import { db } from '$lib/server/db';
import { user as userTable, creatures } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const targetId = params.id;
    
    // 1. Fetch the target user (from URL)
    const [userData] = await db.select({
        id: userTable.id,
        name: userTable.name,
        gems: userTable.gems,
        email: userTable.email
    })
    .from(userTable)
    .where(eq(userTable.id, targetId));

    if (!userData) {
        throw error(404, { message: "Trainer not found" });
    }

    // 2. Fetch that user's creatures
    const userCreatures = await db.select()
        .from(creatures)
        .where(eq(creatures.userId, targetId));

    // 3. Determine if this is the user's own profile
    const isOwnProfile = locals.user?.id === targetId;

    return {
        profile: userData,
        creatures: userCreatures,
        isOwnProfile
    };
};