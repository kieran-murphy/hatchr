<script lang="ts">
    import { User, Mail, ShieldCheck, Gem, ChevronRight, Star, Swords, LayoutGrid, Fingerprint } from 'lucide-svelte/icons';
    import { fly } from 'svelte/transition';
    let { data } = $props();

    // Use derived state for favorites based on whoever's profile we are looking at
    let favorites = $derived(data.creatures?.filter(c => c.isFavorite) ?? []);

    // Logic for new totals
    let totalCount = $derived(data.creatures?.length ?? 0);
    let uniqueTypes = $derived(new Set(data.creatures?.map(c => c.speciesName)).size);

    const rarityBorders = {
        COMMON: 'border-white/5',
        RARE: 'border-blue-500/30',
        EPIC: 'border-purple-500/30',
        LEGENDARY: 'border-yellow-500/50 shadow-[0_0_20px_rgba(250,204,21,0.15)]'
    };
</script>

<div class="max-w-3xl mx-auto py-16 px-6 relative">
    <div class="bg-[#0A0A0A]/60 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        
        <header class="mb-12 flex flex-col items-center text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <User size={48} strokeWidth={2.5} class="text-white" />
            </div>
            <h1 class="text-5xl font-black tracking-tighter text-white uppercase italic">
                {data.profile.name}
            </h1>
            <p class="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2">
                Hatchr ID: {data.profile.id?.slice(0, 8) ?? 'RANKED TRAINER'}
            </p>
        </header>

        <!-- TOP 4 SHOWCASE SECTION -->
        <section class="mb-12">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                    <Star size={14} class="text-yellow-400" fill="currentColor" />
                    Top 4 Showcase
                </h2>
            </div>

            {#if favorites.length === 0}
                <div class="group border-2 border-dashed border-white/5 bg-white/[0.02] rounded-[2rem] py-12 text-center">
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest">No featured creatures</p>
                </div>
            {:else}
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {#each favorites as fav (fav.id)}
                        <div 
                            in:fly={{ y: 20, duration: 400 }}
                            class="group relative aspect-square bg-[#0D0D0D] border rounded-3xl p-4 transition-all {rarityBorders[fav.rarity] || 'border-white/5'}"
                        >
                            <img src={fav.imageUrl} alt="" class="w-full h-full object-contain" />
                            <div class="absolute inset-x-0 bottom-3 text-center">
                                <p class="text-[9px] font-black text-white/50 uppercase italic truncate px-2">
                                    {fav.speciesName}
                                </p>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </section>

        <!-- PRIVACY FILTERED STATS SECTION -->
        <div class="space-y-4">
            {#if data.isOwnProfile}
                <!-- Only the owner sees their Gems and Email -->
                <div class="group relative bg-white/5 border border-white/10 rounded-3xl p-8 transition-all hover:border-blue-500/30 overflow-hidden">
                    <div class="flex justify-between items-end">
                        <div>
                            <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Gem size={12} class="text-blue-400" />
                                Your Vault Balance
                            </p>
                            <h2 class="text-6xl font-mono font-bold text-white tracking-tighter leading-none">
                                {data.profile.gems?.toLocaleString() ?? 0}
                            </h2>
                        </div>
                        <span class="text-4xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">💎</span>
                    </div>
                </div>

                <div class="p-6 bg-[#0D0D0D] border border-white/5 rounded-2xl flex flex-col gap-1">
                    <p class="text-gray-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <Mail size={12} />
                        Private Email
                    </p>
                    <p class="text-gray-200 font-bold truncate">{data.profile.email}</p>
                </div>
            {/if}

            <!-- COLLECTION TOTALS -->
            <div class="grid grid-cols-2 gap-4">
                <div class="p-6 bg-[#0D0D0D] border border-white/5 rounded-2xl flex flex-col gap-1">
                    <p class="text-gray-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <LayoutGrid size={12} class="text-indigo-400" />
                        Total Creatures
                    </p>
                    <p class="text-2xl font-black text-white italic">{totalCount}</p>
                </div>

                <div class="p-6 bg-[#0D0D0D] border border-white/5 rounded-2xl flex flex-col gap-1">
                    <p class="text-gray-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <Fingerprint size={12} class="text-blue-400" />
                        Collected Types
                    </p>
                    <p class="text-2xl font-black text-white italic">{uniqueTypes}/25</p>
                </div>
            </div>

        </div>

        <footer class="mt-12 flex flex-col gap-3">
            {#if data.isOwnProfile}
                <a href="/" class="group flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-black uppercase text-sm rounded-2xl transition-all hover:scale-[1.02]">
                    Back to My Collection
                    <ChevronRight size={18} strokeWidth={3} />
                </a>
            {/if}
        </footer>
    </div>
</div>