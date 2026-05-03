import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const COOLDOWN_HOURS = 12;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(302, '/login');
    
    const [freshUser] = await db
        .select({ lastChestClaimedAt: userTable.lastChestClaimedAt })
        .from(userTable)
        .where(eq(userTable.id, locals.user.id))
        .limit(1);

    return {
        lastChestClaimedAt: freshUser?.lastChestClaimedAt || null
    };
};

export const actions: Actions = {
    buyGems: async ({ locals }) => {
        const user = locals.user;
        if (!user) return fail(401);

        const now = new Date();

        const [freshUser] = await db
            .select({ lastChestClaimedAt: userTable.lastChestClaimedAt })
            .from(userTable)
            .where(eq(userTable.id, locals.user.id))
            .limit(1);

        if (freshUser?.lastChestClaimedAt) {
            const lastClaimed = new Date(freshUser.lastChestClaimedAt);
            const timeSinceLastClaim = now.getTime() - lastClaimed.getTime();
            
            if (timeSinceLastClaim < COOLDOWN_MS) {
                return fail(400, { message: "Chest is still cooling down!" });
            }
        }

        const randomAmount = Math.floor(Math.random() * (1000 - 200 + 1)) + 200;

        try {
            await db.update(userTable)
                .set({ 
                    gems: sql`${userTable.gems} + ${randomAmount}`,
                    lastChestClaimedAt: now
                })
                .where(eq(userTable.id, user.id));

            return { success: true, added: randomAmount, claimedAt: now.toISOString() };
        } catch (e) {
            console.error('Failed to process mystery chest:', e);
            return fail(500, { message: "The bank is closed. Try again later." });
        }
    }
};