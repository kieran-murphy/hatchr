<script lang="ts">
    import { enhance } from '$app/forms';
    import { Calendar, Shield, ChevronLeft, Loader2 } from 'lucide-svelte/icons';
    import { fly, fade } from 'svelte/transition';
    
    let { data } = $props();
    let creature = $derived(data.creature);

    const rarityColors = {
        COMMON: 'text-gray-400',
        RARE: 'text-blue-400',
        EPIC: 'text-purple-400',
        LEGENDARY: 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]'
    };

    const rarityBgColors = {
        COMMON: 'bg-gray-400/10',
        RARE: 'bg-blue-400/10',
        EPIC: 'bg-purple-400/10',
        LEGENDARY: 'bg-yellow-400/10'
    };

</script>

{#if creature}
    <div in:fade class="max-w-4xl mx-auto py-12 px-6">
        <a href="/" class="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group">
            <ChevronLeft size={18} class="group-hover:-translate-x-1 transition-transform" />
            BACK TO COLLECTION
        </a>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div in:fly={{ x: -20, duration: 600 }} class="relative group">
            <div class="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full -z-10 group-hover:bg-blue-600/30 transition-colors"></div>
            
            <img 
                src={creature.imageUrl} 
                alt={creature.speciesName}
                class="w-full aspect-square rounded-[3rem] bg-black/40 border border-white/10 p-8 shadow-2xl"
            />
        </div>

        <div in:fly={{ x: 20, duration: 600, delay: 100 }} class="space-y-8">
            <div>
                <span class="text-[10px] font-black uppercase tracking-[0.4em] {rarityColors[creature.rarity]}">
                    {creature.rarity} SPECIES
                </span>
                <h1 class="text-6xl font-black text-white italic tracking-tighter uppercase leading-none mt-2">
                    {creature.speciesName}
                </h1>
            </div>

            <div class="grid grid-cols-1 gap-4">
                <div class="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div class="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p class="text-[10px] text-slate-500 font-black uppercase">Hatch Date</p>
                        <p class="text-white font-bold">{new Date(creature.hatchedAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div class="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-colors hover:bg-white/[0.07]">
                    <div class="p-3 rounded-xl {rarityBgColors[creature.rarity]} {rarityColors[creature.rarity]}">
                        <Shield size={20} />
                    </div>
                    <div>
                        <p class="text-[10px] text-slate-500 font-black uppercase">Tier Level</p>
                        <p class="text-white font-black uppercase italic tracking-wider">
                            {creature.rarity}
                        </p>
                    </div>
                </div>
            </div>

            <div class="pt-6 border-t border-white/5">
                <form 
                        method="POST" 
                        action="?/release" 
                        use:enhance={({ cancel }) => {
                            const confirmed = confirm("Are you sure? This creature will return to the wild for 5 Gems.");
                            if (!confirmed) {
                                cancel();
                                return;
                            };
                            
                            return async ({ update }) => {
                                await update();
                            };
                        }}
                    >
                        <button class="w-full py-4 bg-red-500/5 border border-red-500/20 text-red-500 font-black uppercase tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95 cursor-pointer">
                            Release to Wild (+5 💎)
                        </button>
                    </form>
            </div>
        </div>
    </div>
    </div>
{:else}
    <div class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 class="animate-spin text-blue-500" size={48} />
        <p class="text-slate-500 font-black uppercase text-[10px] tracking-widest">Syncing Nursery Data...</p>
    </div>
{/if}