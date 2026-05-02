import { db } from '$lib/server/db';
import { user as userTable, creatures } from '$lib/server/db/schema'; // Import creatures table
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {

    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const [userData] = await db.select({
        id: userTable.id,
        name: userTable.name,
        gems: userTable.gems,
        email: userTable.email
    })
    .from(userTable)
    .where(eq(userTable.id, locals.user.id));

    const userCreatures = await db.select()
        .from(creatures)
        .where(eq(creatures.userId, locals.user.id));

    return {
        profile: userData,
        creatures: userCreatures
    };
};