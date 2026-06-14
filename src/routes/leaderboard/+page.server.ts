import { db } from '$lib/server/db';
import { user, creatures } from '$lib/server/db/schema';
import { desc, sql, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const uniqueTypeCombo = sql`least(${creatures.type1}, ${creatures.type2}) || '-' || greatest(${creatures.type1}, ${creatures.type2})`;

    const leaderboardData = await db
        .select({
            id: user.id,
            username: user.name,
            image: user.image,
            uniqueCount: sql<number>`cast(count(distinct ${uniqueTypeCombo}) as int)`
        })
        .from(user)
        .leftJoin(creatures, eq(user.id, creatures.userId))
        .groupBy(user.id, user.name, user.image)
        .orderBy(desc(sql`count(distinct ${uniqueTypeCombo})`))
        .limit(50);

    return {
        leaderboard: leaderboardData
    };
};