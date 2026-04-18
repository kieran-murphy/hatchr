<script lang="ts">
    import { enhance } from '$app/forms';
    let { form } = $props();
    
    let hatching = $state(false);
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh] gap-6">
    <h1 class="text-4xl font-black tracking-tighter text-white">THE NURSERY</h1>
    
    <p class="text-gray-400">Ready to see what's inside the egg?</p>

    <form 
        method="POST" 
        use:enhance={() => {
            hatching = true;
            return async ({ update }) => {
                hatching = false;
                update();
            };
        }}
    >
        <button 
            disabled={hatching}
            class="group relative px-8 py-4 bg-blue-600 rounded-2xl font-bold text-xl overflow-hidden transition-all hover:bg-blue-500 disabled:opacity-50"
        >
            <span class="relative z-10">
                {hatching ? 'HATCHING...' : 'HATCH EGG'}
            </span>
            
            <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
        </button>
    </form>

    {#if form?.success}
        <div class="mt-4 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg animate-bounce">
            🎉 A new creature was added to your collection!
        </div>
    {/if}
    
    {#if form?.message}
        <p class="text-red-400">{form.message}</p>
    {/if}
</div>