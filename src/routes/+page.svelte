<script lang="ts">
    import { flip } from 'svelte/animate';
    import { quintOut } from 'svelte/easing';
    import { scale } from 'svelte/transition';
    import { ListFilter } from '@lucide/svelte';
    import { resolve } from '$app/paths';

    let { data } = $props();

    const rarityColors = {
        COMMON: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
        UNCOMMON: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        RARE: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        LEGENDARY: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
    };

    const AVAILABLE_TYPES = ['All', 'Cosmic', 'Crystal', 'Dark', 'Dragon', 'Electric', 'Fire', 'Ghost', 'Grass', 'Ground', 'Ice', 'Poison', 'Psychic', 'Water'];

    const typeStyles: Record<string, { text: string, dot: string }> = {
        'All': { text: 'text-white', dot: 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]' },
        'Cosmic': { text: 'text-fuchsia-400', dot: 'bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.6)]' },
        'Crystal': { text: 'text-cyan-300', dot: 'bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.6)]' },
        'Dark': { text: 'text-indigo-400', dot: 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.6)]' },
        'Dragon': { text: 'text-orange-500', dot: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]' },
        'Electric': { text: 'text-yellow-300', dot: 'bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.6)]' },
        'Fire': { text: 'text-red-500', dot: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' },
        'Ghost': { text: 'text-purple-400', dot: 'bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.6)]' },
        'Grass': { text: 'text-green-400', dot: 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)]' },
        'Ground': { text: 'text-amber-500', dot: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]' },
        'Ice': { text: 'text-sky-300', dot: 'bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.6)]' },
        'Poison': { text: 'text-emerald-400', dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' },
        'Psychic': { text: 'text-pink-400', dot: 'bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.6)]' },
        'Water': { text: 'text-blue-500', dot: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]' }
    };

    let visibleCreatures = $state(data.creatures);
    let isLoading = $state(false);
    let hasMore = $state(data.creatures.length === 20);
    let sortBy = $state('recent');
    let filterType = $state('All');
    let isTypeMenuOpen = $state(false);
    let isSortMenuOpen = $state(false);
    let showDuplicates = $state(false);

    const rarityWeight = {
        'LEGENDARY': 4,
        'RARE': 3,
        'UNCOMMON': 2,
        'COMMON': 1
    };

    let sortedCreatures = $derived.by(() => {
        let list = [...visibleCreatures];

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

    async function reloadCollection() {
        isLoading = true;
        const res = await fetch(`/api/collection?offset=0&type=${filterType}&duplicates=${showDuplicates}`);
        const result = await res.json();
        
        visibleCreatures = result.creatures || [];
        hasMore = visibleCreatures.length === 20;
        isLoading = false;
    }

    async function applyTypeFilter(newType: string) {
        if (filterType === newType) return;
        filterType = newType;
        showDuplicates = false;
        await reloadCollection();
    }

    async function toggleDuplicates() {
        showDuplicates = !showDuplicates;
        await reloadCollection();
    }

    async function loadMore() {
        if (isLoading || !hasMore) return;
        isLoading = true;

        const res = await fetch(`/api/collection?offset=${visibleCreatures.length}&type=${filterType}&duplicates=${showDuplicates}`);
        const result = await res.json();

        if (result.creatures && result.creatures.length > 0) {
            visibleCreatures = [...visibleCreatures, ...result.creatures];
            
            if (result.creatures.length < 20) {
                hasMore = false;
            }
        } else {
            hasMore = false;
        }

        isLoading = false;
    }
</script>

<div class="mx-auto max-w-7xl p-6 md:p-12">
    <header class="mb-12">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
                <h1 class="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">Your Collection</h1>
                <p class="font-bold text-blue-500 uppercase text-[10px] tracking-widest mt-1">
                    {visibleCreatures.length} Creatures Loaded
                </p>
            </div>
            <a href={resolve('/hatch')} class="w-full sm:w-auto text-center rounded-xl bg-blue-600 px-6 py-3 font-black text-white transition hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-600/20 uppercase text-xs tracking-widest">
                Hatch More
            </a>
        </div>

        <div class="flex flex-wrap items-center gap-4">
            
            <div class="relative w-full md:w-auto">
                <button 
                    onclick={() => isSortMenuOpen = !isSortMenuOpen}
                    class="w-full md:w-auto flex items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-2xl px-5 py-3 hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <div class="flex items-center gap-3 text-white">
                        <ListFilter size={16} class="text-slate-500" />
                        <span class="text-[10px] font-black uppercase tracking-widest">
                            Sort: {sortBy}
                        </span>
                    </div>
                    <svg class="h-3 w-3 text-slate-500 transition-transform {isSortMenuOpen ? 'rotate-180' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                </button>

                {#if isSortMenuOpen}
                    <button 
                        class="fixed inset-0 w-full h-full z-40 cursor-default" 
                        onclick={() => isSortMenuOpen = false}
                        aria-label="Close sort menu"
                    ></button>
                    
                    <div 
                        in:scale={{ duration: 150, start: 0.95 }}
                        class="absolute left-0 mt-2 w-full md:w-48 max-h-80 overflow-y-auto bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 z-50 flex flex-col shadow-2xl custom-scrollbar"
                    >
                        <div class="px-4 py-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">Sort By</div>
                        {#each ['recent', 'rarity', 'alphabetical'] as option (option)}
                            <button 
                                onclick={() => { sortBy = option; isSortMenuOpen = false; }}
                                class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 w-full text-left {sortBy === option ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}"
                            >
                                <span class="text-[10px] font-black uppercase tracking-widest">
                                    {option}
                                </span>
                            </button>
                        {/each}

                        <div class="w-full h-px bg-white/10 my-2 shrink-0"></div>
                        <div class="px-4 py-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">Filters</div>
                        
                        <button 
                            onclick={() => { toggleDuplicates(); isSortMenuOpen = false; }}
                            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 w-full text-left {showDuplicates ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}"
                        >
                            <span class="text-[10px] font-black uppercase tracking-widest">
                                Duplicates {showDuplicates ? '(On)' : ''}
                            </span>
                        </button>
                    </div>
                {/if}
            </div>

            <div class="relative w-full md:w-auto">
                <button 
                    onclick={() => isTypeMenuOpen = !isTypeMenuOpen}
                    class="w-full md:w-auto flex items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-2xl px-5 py-3 hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full {typeStyles[filterType].dot}"></div>
                        <span class="text-[10px] font-black uppercase tracking-widest {typeStyles[filterType].text}">
                            {filterType}
                        </span>
                    </div>
                    <svg class="h-3 w-3 text-slate-500 transition-transform {isTypeMenuOpen ? 'rotate-180' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                </button>

                {#if isTypeMenuOpen}
                    <button 
                        class="fixed inset-0 w-full h-full z-40 cursor-default" 
                        onclick={() => isTypeMenuOpen = false}
                        aria-label="Close type menu"
                    ></button>
                    
                    <div 
                        in:scale={{ duration: 150, start: 0.95 }}
                        class="absolute left-0 mt-2 w-full md:w-48 max-h-80 overflow-y-auto bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 z-50 flex flex-col shadow-2xl custom-scrollbar"
                    >
                        {#each AVAILABLE_TYPES as type (type)}
                            <button 
                                onclick={() => { applyTypeFilter(type); isTypeMenuOpen = false; }}
                                class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 w-full text-left {filterType === type ? 'bg-white/10' : ''}"
                            >
                                <div class="w-2.5 h-2.5 rounded-full {typeStyles[type].dot}"></div>
                                <span class="text-[10px] font-black uppercase tracking-widest {typeStyles[type].text}">
                                    {type}
                                </span>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </header>
    
    {#if sortedCreatures.length === 0}
        <div class="rounded-[2.5rem] border border-white/5 bg-[#0A0A0A]/60 backdrop-blur-xl py-32 text-center">
            {#if showDuplicates}
                <p class="mb-6 text-gray-500 font-medium">No identical types found in your collection.</p>
            {:else if filterType !== 'All'}
                <p class="mb-6 text-gray-500 font-medium">No <span class={typeStyles[filterType].text}>{filterType}</span>-type creatures found in your collection.</p>
            {:else}
                <p class="mb-6 text-gray-500 font-medium">Your collection is empty.</p>
            {/if}
            <a href={resolve('/hatch')} class="font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
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
                        href={resolve(`/creature/${creature.id}`)}
                        class="group relative rounded-2xl border border-white/5 bg-[#0A0A0A]/60 backdrop-blur-md p-4 transition-all hover:-translate-y-2 hover:border-white/20 hover:bg-[#0D0D0D] block"
                    >
                        <div class="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-black/40">
                            <img
                                src={creature.imageUrl}
                                alt={creature.speciesName}
                                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
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
                </div>
            {/each}
        </div>

        {#if hasMore}
            <div class="mt-12 flex justify-center">
                <button 
                    onclick={loadMore} 
                    disabled={isLoading}
                    class="w-full md:w-auto px-12 py-4 bg-white/5 text-white text-xs tracking-widest font-black uppercase border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                >
                    {isLoading ? 'Summoning...' : 'Load More Creatures'}
                </button>
            </div>
        {/if}
    {/if}
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }
</style>