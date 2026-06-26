import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const SMALL_COOLDOWN_MS = 1 * 60 * 60 * 1000;      // 1 hour
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;    // 24 hours

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(302, '/login');
    
    const [freshUser] = await db
        .select({ 
            lastChestClaimedAt: userTable.lastChestClaimedAt,
            lastDailyRewardClaimedAt: userTable.lastDailyRewardClaimedAt 
        })
        .from(userTable)
        .where(eq(userTable.id, locals.user.id))
        .limit(1);

    return {
        lastChestClaimedAt: freshUser?.lastChestClaimedAt || null,
        lastDailyRewardClaimedAt: freshUser?.lastDailyRewardClaimedAt || null
    };
};

export const actions: Actions = {
    // 1-Hour Small Reward Action
    claimSmall: async ({ locals }) => {
        const user = locals.user;
        if (!user) return fail(401);

        const now = new Date();
        const [freshUser] = await db
            .select({ lastChestClaimedAt: userTable.lastChestClaimedAt })
            .from(userTable)
            .where(eq(userTable.id, user.id))
            .limit(1);

        if (freshUser?.lastChestClaimedAt) {
            const timeSinceLastClaim = now.getTime() - freshUser.lastChestClaimedAt.getTime();
            if (timeSinceLastClaim < SMALL_COOLDOWN_MS) {
                return fail(400, { message: "Small chest is still cooling down!" });
            }
        }

        const amount = Math.floor(Math.random() * (600 - 200 + 1)) + 200;

        await db.update(userTable)
            .set({ 
                gems: sql`${userTable.gems} + ${amount}`,
                lastChestClaimedAt: now
            })
            .where(eq(userTable.id, user.id));

        return { success: true, added: amount, type: 'small' };
    },

    // 24-Hour Big Reward Action
    claimDaily: async ({ locals }) => {
        const user = locals.user;
        if (!user) return fail(401);

        const now = new Date();
        const [freshUser] = await db
            .select({ lastDailyRewardClaimedAt: userTable.lastDailyRewardClaimedAt })
            .from(userTable)
            .where(eq(userTable.id, user.id))
            .limit(1);

        if (freshUser?.lastDailyRewardClaimedAt) {
            const timeSinceLastClaim = now.getTime() - freshUser.lastDailyRewardClaimedAt.getTime();
            if (timeSinceLastClaim < DAILY_COOLDOWN_MS) {
                return fail(400, { message: "Daily reward is not ready yet!" });
            }
        }

        // Bigger reward for daily streak
        const amount = Math.floor(Math.random() * (2000 - 200 + 1)) + 300;

        await db.update(userTable)
            .set({ 
                gems: sql`${userTable.gems} + ${amount}`,
                lastDailyRewardClaimedAt: now
            })
            .where(eq(userTable.id, user.id));

        return { success: true, added: amount, type: 'daily' };
    }
};