import { db } from '$lib/server/db';
import { user as userTable, creatures, follows } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const targetId = params.id;
    
    const [userData] = await db.select({
        id: userTable.id,
        name: userTable.name,
        gems: userTable.gems,
        email: userTable.email,
        image: userTable.image,
    })
    .from(userTable)
    .where(eq(userTable.id, targetId));

    if (!userData) {
        throw error(404, { message: "Trainer not found" });
    }

    const userCreatures = await db.select()
        .from(creatures)
        .where(eq(creatures.userId, targetId));

    const isOwnProfile = locals.user?.id === targetId;

    const followersData = await db.select({
        id: userTable.id,
        name: userTable.name,
        image: userTable.image,
        creaturesCount: count(creatures.id)
    })
    .from(follows)
    .innerJoin(userTable, eq(follows.followerId, userTable.id))
    .leftJoin(creatures, eq(userTable.id, creatures.userId))
    .where(eq(follows.followingId, targetId))
    .groupBy(userTable.id);

    const followingData = await db.select({
        id: userTable.id,
        name: userTable.name,
        image: userTable.image,
        creaturesCount: count(creatures.id)
    })
    .from(follows)
    .innerJoin(userTable, eq(follows.followingId, userTable.id))
    .leftJoin(creatures, eq(userTable.id, creatures.userId))
    .where(eq(follows.followerId, targetId))
    .groupBy(userTable.id);

    const mappedFollowers = followersData.map(user => ({ follower: user }));
    const mappedFollowing = followingData.map(user => ({ following: user }));

    let isFollowing = false;
    if (locals.user && !isOwnProfile) {
        const [existingFollow] = await db.select()
            .from(follows)
            .where(and(
                eq(follows.followerId, locals.user.id),
                eq(follows.followingId, targetId)
            ));
        
        isFollowing = !!existingFollow;
    }

    return {
        profile: {
            ...userData,
            followers: mappedFollowers,
            following: mappedFollowing
        },
        creatures: userCreatures,
        isOwnProfile,
        isFollowing
    };
};

export const actions: Actions = {
    toggleFollow: async ({ params, locals }) => {
        if (!locals.user) {
            return fail(401, { message: "You must be logged in to follow trainers." });
        }

        const targetId = params.id;
        const currentUserId = locals.user.id;

        if (currentUserId === targetId) {
            return fail(400, { message: "You cannot follow yourself." });
        }

        const [existingFollow] = await db.select()
            .from(follows)
            .where(and(
                eq(follows.followerId, currentUserId),
                eq(follows.followingId, targetId)
            ));

        if (existingFollow) {
            await db.delete(follows)
                .where(and(
                    eq(follows.followerId, currentUserId),
                    eq(follows.followingId, targetId)
                ));
        } else {
            await db.insert(follows).values({
                followerId: currentUserId,
                followingId: targetId
            });
        }

        return { success: true };
    }
};