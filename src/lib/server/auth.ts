import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema'; // Import your schema

export const auth = betterAuth({
    baseURL: env.ORIGIN,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { 
        provider: 'pg',
        schema: schema 
    }),
    emailAndPassword: { enabled: true },
    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
            mapProfileToUser: (profile) => {
                return {
                    image: profile.avatar_url,
                };
            }
        },
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            mapProfileToUser: (profile) => {
                return {
                    image: profile.picture,
                };
            }
        }
    },
    user: {
        changeEmail: {
            enabled: true
        }
    },
    plugins: [
        sveltekitCookies(getRequestEvent)
    ]
});