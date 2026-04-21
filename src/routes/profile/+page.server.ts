import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const [userData] = await db.select({
        name: userTable.name,
        gems: userTable.gems,
        email: userTable.email
    })
    .from(userTable)
    .where(eq(userTable.id, locals.user.id));

    return {
        profile: userData
    };
};