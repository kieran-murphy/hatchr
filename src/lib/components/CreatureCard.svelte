<script lang="ts">
    import { resolve } from '$app/paths';
    import { typeStyles } from '$lib/game.js';
    import { Star } from '@lucide/svelte';

    let { creature } = $props();

    const rarityColors = {
        COMMON: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
        UNCOMMON: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        RARE: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        LEGENDARY: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
    };
</script>

<a
    href={resolve(`/creature/${creature.id}`)}
    class="group relative rounded-2xl border border-white/5 bg-[#0A0A0A]/60 backdrop-blur-md p-4 transition-all hover:-translate-y-2 hover:border-white/20 hover:bg-[#0D0D0D] block"
>
    <div class="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-black/40">
        <img
            src={creature.imageUrl}
            alt={creature.speciesName}
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {#if creature.isFavorite}
            <div class="absolute top-2 right-2 bg-black/50 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                <Star size={20} class="fill-yellow-400 text-yellow-400" />
            </div>
        {/if}
    </div>

    <div class="space-y-2">
        <div class="flex flex-col items-start gap-1.5">
            <div class="flex flex-wrap items-center gap-2">
                {#if creature.type1 && typeStyles[creature.type1]}
                    <span class="inline-flex items-center gap-1.5 rounded border border-white/5 bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter {typeStyles[creature.type1].text}">
                        <span class="w-1.5 h-1.5 rounded-full {typeStyles[creature.type1].dot}"></span>
                        {creature.type1}
                    </span>
                {/if}

                {#if creature.type2 && typeStyles[creature.type2]}
                    <span class="inline-flex items-center gap-1.5 rounded border border-white/5 bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter {typeStyles[creature.type2].text}">
                        <span class="w-1.5 h-1.5 rounded-full {typeStyles[creature.type2].dot}"></span>
                        {creature.type2}
                    </span>
                {/if}
            </div>
            
            <span class="inline-block rounded border px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter {rarityColors[creature.rarity]}">
                {creature.rarity}
            </span>
        </div>
        
        <h3 class="text-lg leading-tight font-black italic tracking-tighter text-white uppercase group-hover:text-blue-400 transition-colors">
            {creature.speciesName}
        </h3>
    </div>
</a>