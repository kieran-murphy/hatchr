<script lang="ts">
    import { enhance } from '$app/forms';
    import { scale, fade } from 'svelte/transition';
    import creatureImg from '$lib/assets/silhouette.png';
    
    let { data, form } = $props();
    
    let hatching = $state(false);

    const rarityStyles = {
        COMMON: 'text-gray-400 border-gray-400/20 bg-gray-400/5',
        RARE: 'text-blue-400 border-blue-400/20 bg-blue-400/5 shadow-[0_0_15px_rgba(96,165,250,0.2)]',
        EPIC: 'text-purple-400 border-purple-400/20 bg-purple-400/5 shadow-[0_0_15px_rgba(192,132,252,0.2)]',
        LEGENDARY: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5 shadow-[0_0_20px_rgba(250,204,21,0.3)] animate-pulse'
    };
</script>

<div class="flex flex-col items-center justify-center min-h-[80vh] gap-8 p-6">
    <div class="flex flex-col items-center gap-4">
        <div class="px-5 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-3">
            <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Balance</span>
            <span class="text-xl font-mono font-bold text-blue-400">{data.userGems?.toLocaleString() ?? 0} 💎</span>
        </div>

        <div class="text-center">
            <p class="text-gray-500 font-medium italic">Cost: 10 Gems</p>
        </div>
    </div>

    <div class="min-h-[300px] flex items-center justify-center">
        {#if form?.success && !hatching}
            <div in:scale={{ duration: 400, start: 0.8 }} out:fade={{ duration: 200 }} class="flex flex-col items-center gap-4">
                <div class="relative group">
                    <img 
                        src={creatureImg} 
                        alt="New Creature" 
                        class="w-48 h-48 rounded-3xl bg-black/40 border-2 border-white/10 p-4"
                    />
                    <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-black border border-white/20">
                        <span class="text-[10px] font-black uppercase tracking-tighter {rarityStyles[form.creature.rarity].split(' ')[0]}">
                            {form.creature.rarity}
                        </span>
                    </div>
                </div>

                <div class="text-center">
                    <h2 class="text-3xl font-black text-white uppercase italic">{form.creature.speciesName}</h2>
                    <a href="/collection" class="text-xs text-blue-500/50 hover:text-blue-500 transition-colors uppercase font-bold tracking-widest">Added to Collection</a>
                </div>
            </div>
        {:else if hatching}
            <div in:fade class="text-9xl animate-bounce">🥚</div>
        {:else}
            <div class="text-white/10 text-9xl italic font-black select-none">?</div>
        {/if}
    </div>

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
            disabled={hatching || data.userGems < 10}
            class="group relative px-12 py-5 bg-blue-600 rounded-2xl font-black text-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer"
        >
            <span class="relative z-10 flex items-center gap-3">
                {#if hatching}
                    CRACKING...
                {:else}
                    <span>🥚</span> HATCH
                {/if}
            </span>
            
            <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
        </button>
    </form>

    {#if form?.message}
        <p class="text-red-400 font-medium bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
            {form.message}
        </p>
    {/if}
</div>