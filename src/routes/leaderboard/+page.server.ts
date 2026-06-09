import { db } from '$lib/server/db';
import { user, creatures } from '$lib/server/db/schema';
import { desc, sql, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const leaderboardData = await db
        .select({
            id: user.id,
            username: user.name,
            image: user.image,
            uniqueCount: sql<number>`cast(count(distinct ${creatures.speciesName}) as int)`
        })
        .from(user)
        .leftJoin(creatures, eq(user.id, creatures.userId))
        .groupBy(user.id, user.name, user.image)
        .orderBy(desc(sql`count(distinct ${creatures.speciesName})`))
        .limit(50);

    return {
        leaderboard: leaderboardData
    };
};