// src/routes/api/users/search/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { ilike, or } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

    const query = url.searchParams.get('q');
    
    if (!query || query.length < 2) return json([]);

    try {
        const results = await db.select({
            id: userTable.id,
            username: userTable.name, 
            gems: userTable.gems
        })
        .from(userTable)
        .where(
            ilike(userTable.name, `%${query}%`)
        )
        .limit(10);

        return json(results);
    } catch (error) {
        console.error('Search error:', error);
        return json({ error: 'Failed to search users' }, { status: 500 });
    }
};