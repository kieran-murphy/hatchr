import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db'; 
import { user, creatures } from '$lib/server/db/schema';
import { ilike, count, eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
    const searchQuery = url.searchParams.get('q');

    if (!searchQuery) {
        return json([]);
    }

    try {
        const searchResults = await db
            .select({
                id: user.id,
                username: user.name,
                image: user.image,
                creatures: count(creatures.id)
            })
            .from(user)
            .leftJoin(creatures, eq(user.id, creatures.userId))
            .where(ilike(user.name, `%${searchQuery}%`))
            .groupBy(user.id)
            .limit(10);

        return json(searchResults);

    } catch (error) {
        console.error("Database error during search:", error);
        return json({ error: "Failed to fetch users" }, { status: 500 });
    }
};