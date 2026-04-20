<script lang="ts">
    let { data } = $props();

    const rarityColors = {
        COMMON: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
        UNCOMMON: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        RARE: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        LEGENDARY: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
    };
</script>

<div class="max-w-7xl mx-auto p-6 md:p-12">
    <header class="flex justify-between items-end mb-12">
        <div>
            <h1 class="text-4xl font-black tracking-tighter text-white uppercase">Your Collection</h1>
            <p class="text-gray-500 font-medium">Total Creatures: {data.creatures.length}</p>
        </div>
        <a href="/hatch" class="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
            Hatch More
        </a>
    </header>

    {#if data.creatures.length === 0}
        <div class="text-center py-32 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
            <p class="text-gray-500 mb-6">Your collection is empty. Time to hatch some eggs!</p>
            <a href="/hatch" class="text-blue-500 font-bold hover:underline underline-offset-4">Go to the Nursery →</a>
        </div>
    {:else}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {#each data.creatures as creature (creature.id)}
                <div class="group relative bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:border-white/20">
                    <div class="aspect-square rounded-xl bg-black mb-4 overflow-hidden border border-white/5 flex items-center justify-center">
                        <img 
                            src={creature.imageUrl} 
                            alt={creature.speciesName}
                            class="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                    </div>

                    <div class="space-y-2">
                        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-black border uppercase {rarityColors[creature.rarity]}">
                            {creature.rarity}
                        </span>
                        <h3 class="text-white font-bold tracking-tight text-lg leading-tight">
                            {creature.speciesName}
                        </h3>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>