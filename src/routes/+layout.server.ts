import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
    // We don't redirect here because we want logged-out users 
    // to still be able to see the Home/About pages.
    return { 
        user: locals.user // This will be null if not logged in
    };
};