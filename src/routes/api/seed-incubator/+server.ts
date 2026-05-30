import { maintainCreatureQueue } from '$lib/server/generation';
import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        console.log("Starting manual generation...");
        await maintainCreatureQueue();
        console.log("Generation complete!");
        
        return json({ success: true, message: "Incubator seeded! You can now hatch an egg." });
    } catch (error) {
        console.error("Failed to seed incubator:", error);
        return json({ success: false, error: String(error) }, { status: 500 });
    }
}