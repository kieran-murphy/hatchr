import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(302, '/login');
    return {};
};

export const actions: Actions = {
    buyGems: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) return fail(401);

        const formData = await request.formData();
        const amount = Number(formData.get('amount'));

        if (isNaN(amount) || amount <= 0) {
            return fail(400, { message: "Invalid gem amount." });
        }

        try {
            await db.update(userTable)
                .set({ gems: sql`${userTable.gems} + ${amount}` })
                .where(eq(userTable.id, user.id));

            return { success: true, added: amount };
        } catch (e) {
            return fail(500, { message: "The bank is closed. Try again later." });
        }
    }
};