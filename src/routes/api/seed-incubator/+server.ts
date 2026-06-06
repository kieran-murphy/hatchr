import { maintainCreatureQueue, maintainDualCreatureQueue } from '$lib/server/generation';
import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        console.log("Starting manual generation...");
        
        await maintainCreatureQueue();
        await maintainDualCreatureQueue();
        
        console.log("Generation complete!");
        
        return json({ success: true, message: "Incubators seeded! You can now hatch single and dual eggs." });
    } catch (error) {
        console.error("Failed to seed incubator:", error);
        return json({ success: false, error: String(error) }, { status: 500 });
    }
}