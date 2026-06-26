import { db } from '$lib/server/db';
import { user, creatures } from '$lib/server/db/schema';
import { sql, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const uniqueTypeCombo = sql`least(${creatures.type1}, ${creatures.type2}) || '-' || greatest(${creatures.type1}, ${creatures.type2})`;

    const leaderboardData = await db
        .select({
            id: user.id,
            username: user.name,
            image: user.image,
            gems: user.gems, 
            uniqueCount: sql<number>`cast(count(distinct ${uniqueTypeCombo}) as int)`,
            totalCount: sql<number>`cast(count(${creatures.id}) as int)`
        })
        .from(user)
        .leftJoin(creatures, eq(user.id, creatures.userId))
        .groupBy(user.id, user.name, user.image, user.gems)
        .limit(100);

    return {
        leaderboard: leaderboardData
    };
};