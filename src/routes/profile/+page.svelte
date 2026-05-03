<script lang="ts">
    import { User, Mail, ShieldCheck, Gem, ChevronRight, Star } from 'lucide-svelte/icons';
    import { fly } from 'svelte/transition';
    let { data } = $props();

    let favorites = $derived(data.creatures?.filter(c => c.isFavorite) ?? []);

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
                <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {favorites.length} / 4 SLOTS
                </span>
            </div>

            {#if favorites.length === 0}
                <div class="group border-2 border-dashed border-white/5 bg-white/[0.02] rounded-[2rem] py-12 text-center transition-colors hover:border-white/10">
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">No featured creatures yet</p>
                    <a href="/" class="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">
                        Go to Collection →
                    </a>
                </div>
            {:else}
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {#each favorites as fav (fav.id)}
                        <a 
                            href="/creature/{fav.id}" 
                            in:fly={{ y: 20, duration: 400 }}
                            class="group relative aspect-square bg-[#0D0D0D] border rounded-3xl p-4 transition-all hover:-translate-y-1 {rarityBorders[fav.rarity] || 'border-white/5'}"
                        >
                            <img 
                                src={fav.imageUrl} 
                                alt="" 
                                class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                            />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-end p-4">
                                <p class="text-[10px] font-black text-white uppercase italic truncate">
                                    {fav.speciesName}
                                </p>
                            </div>
                        </a>
                    {/each}
                </div>
            {/if}
        </section>

        <!-- ACCOUNT STATS SECTION -->
        <div class="space-y-4">
            <div class="group relative bg-white/5 border border-white/10 rounded-3xl p-8 transition-all hover:border-blue-500/30 overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10 group-hover:bg-blue-500/20 transition-colors"></div>
                
                <div class="flex justify-between items-end">
                    <div>
                        <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Gem size={12} class="text-blue-400" />
                            Vault Balance
                        </p>
                        <h2 class="text-6xl font-mono font-bold text-white tracking-tighter leading-none">
                            {data.profile.gems?.toLocaleString() ?? 0}
                        </h2>
                    </div>
                    <span class="text-4xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">💎</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-6 bg-[#0D0D0D] border border-white/5 rounded-2xl flex flex-col gap-1">
                    <p class="text-gray-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <Mail size={12} />
                        Communications
                    </p>
                    <p class="text-gray-200 font-bold truncate">{data.profile.email}</p>
                </div>

                <div class="p-6 bg-[#0D0D0D] border border-white/5 rounded-2xl flex flex-col gap-1">
                    <p class="text-gray-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <ShieldCheck size={12} class="text-green-500" />
                        Account Status
                    </p>
                    <p class="text-green-400 font-black uppercase tracking-tighter italic">Verified Trainer</p>
                </div>
            </div>
        </div>

        <footer class="mt-12 flex flex-col gap-3">
            <a href="/" class="group flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-black uppercase text-sm rounded-2xl transition-all hover:scale-[1.02] active:scale-95">
                Back to Collection
                <ChevronRight size={18} strokeWidth={3} class="group-hover:translate-x-1 transition-transform" />
            </a>
        </footer>
    </div>
</div>