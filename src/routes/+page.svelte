<script lang="ts">
    import { flip } from 'svelte/animate';
    import { quintOut } from 'svelte/easing';
    import { scale, fade } from 'svelte/transition';
    import { ListFilter, Shuffle } from 'lucide-svelte/icons';

    let { data } = $props();

    const rarityColors = {
        COMMON: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
        UNCOMMON: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        RARE: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        LEGENDARY: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
    };

    let sortBy = $state('recent');

    const rarityWeight = {
        'LEGENDARY': 4,
        'RARE': 3,
        'UNCOMMON': 2,
        'COMMON': 1
    };

    let sortedCreatures = $derived.by(() => {
        let list = [...data.creatures];

        if (sortBy === 'rarity') {
            return list.sort((a, b) => rarityWeight[b.rarity] - rarityWeight[a.rarity]);
        }
        
        if (sortBy === 'alphabetical') {
            return list.sort((a, b) => a.speciesName.localeCompare(b.speciesName));
        }

        if (sortBy === 'type') {
            return list.sort((a, b) => (a.speciesName || '').localeCompare(b.speciesName || ''));
        }

        return list; 
    });

</script>

<div class="mx-auto max-w-7xl p-6 md:p-12">
    <header class="mb-12">
    <div class="flex items-end justify-between mb-8">
        <div>
            <h1 class="text-5xl font-black tracking-tighter text-white uppercase italic">Your Collection</h1>
            <p class="font-bold text-blue-500 uppercase text-[10px] tracking-widest mt-1">
                {data.creatures.length} Creatures
            </p>
        </div>
        <a href="/hatch" class="rounded-xl bg-blue-600 px-6 py-3 font-black text-white transition hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-600/20 uppercase text-xs tracking-widest">
            Hatch More
        </a>
    </div>

    <div class="flex items-center gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl w-fit">
        <div class="px-3 text-slate-500">
            <ListFilter size={16} />
        </div>
        
        {#each ['recent', 'rarity', 'alphabetical'] as option (option)}
            <button 
                onclick={() => sortBy = option}
                class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                {sortBy === option ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'}"
            >
                {option}
            </button>
        {/each}

        <button 
            onclick={() => sortedCreatures = [...data.creatures].sort(() => Math.random() - 0.5)}
            class="p-2 text-slate-500 hover:text-blue-400 transition-colors"
            title="Shuffle Collection"
        >
            <Shuffle size={16} />
        </button>
    </div>
</header>

    {#if sortedCreatures.length === 0}
        <div
            class="rounded-[2.5rem] border border-white/5 bg-[#0A0A0A]/60 backdrop-blur-xl py-32 text-center"
        >
            <p class="mb-6 text-gray-500 font-medium">Your collection is empty.</p>
            <a href="/hatch" class="font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                Go Hatch →
            </a>
        </div>
    {:else}
        <div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {#each sortedCreatures as creature (creature.id)}
                <div 
                    animate:flip={{ duration: 600, easing: quintOut }}
                    in:scale={{ duration: 300, start: 0.9 }}
                    class="group"
                >
                <a
                    href="/creature/{creature.id}"
                    in:scale={{ duration: 300, start: 0.95 }}
                    class="group relative rounded-2xl border border-white/5 bg-[#0A0A0A]/60 backdrop-blur-md p-4 transition-all hover:-translate-y-2 hover:border-white/20 hover:bg-[#0D0D0D] block"
                >
                    <div
                        class="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-black/40"
                    >
                        <img
                            src={creature.imageUrl}
                            alt={creature.speciesName}
                            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>

                    <div class="space-y-2">
                        <span
                            class="inline-block rounded border px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter {rarityColors[
                                creature.rarity
                            ]}"
                        >
                            {creature.rarity}
                        </span>
                        <h3 class="text-lg leading-tight font-black italic tracking-tighter text-white uppercase group-hover:text-blue-400 transition-colors">
                            {creature.speciesName}
                        </h3>
                    </div>
                </a>
                </div>
            {/each}
        </div>
    {/if}
</div>