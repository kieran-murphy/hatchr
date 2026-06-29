<script lang="ts">
    import { flip } from 'svelte/animate';
    import { quintOut } from 'svelte/easing';
    import { scale, fade } from 'svelte/transition';
    import { ListFilter } from '@lucide/svelte';
    import { resolve } from '$app/paths';
    import { enhance } from '$app/forms';
    import { typeStyles } from '$lib/game.js';

    import CreatureCard from '$lib/components/CreatureCard.svelte';

    let { data } = $props()

    const AVAILABLE_TYPES = ['All', 'Cosmic', 'Crystal', 'Dark', 'Dragon', 'Electric', 'Fire', 'Ghost', 'Grass', 'Ground', 'Ice', 'Poison', 'Psychic', 'Water'];

    let visibleCreatures = $state(data.creatures);
    let isLoading = $state(false);
    let hasMore = $state(data.creatures.length === 20);
    let sortBy = $state('recent');
    let filterType = $state('All');
    let isTypeMenuOpen = $state(false);
    let isSortMenuOpen = $state(false);
    let showDuplicates = $state(false);

    let isSellModalOpen = $state(false);
    let isReleasing = $state(false);

    let duplicateSummary = $derived.by(() => {
        const getCombo = (c) => c.type2 ? [c.type1, c.type2].sort().join('-') : c.type1;

        const duplicates = visibleCreatures.filter((c, index, self) => 
            self.findIndex(t => getCombo(t) === getCombo(c)) !== index
        );
        
        const count = duplicates.length;
        const gems = duplicates.reduce((acc, c) => acc + (c.type2 ? 100 : 50), 0);
        
        return { count, gems };
    });

    async function reloadCollection() {
        isLoading = true;
        const res = await fetch(`/api/collection?offset=0&type=${filterType}&duplicates=${showDuplicates}&sort=${sortBy}`);
        const result = await res.json();
        
        visibleCreatures = result.creatures || [];
        hasMore = visibleCreatures.length === 20;
        isLoading = false;
    }

    async function applySort(newSort: string) {
        if (sortBy === newSort) return;
        sortBy = newSort;
        isSortMenuOpen = false;
        await reloadCollection();
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

        const res = await fetch(`/api/collection?offset=${visibleCreatures.length}&type=${filterType}&duplicates=${showDuplicates}&sort=${sortBy}`);
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
                                onclick={() => applySort(option)}
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
                                class="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:bg-white/5 w-full text-left {filterType === type ? 'bg-white/10' : ''}"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="w-2.5 h-2.5 rounded-full {typeStyles[type].dot}"></div>
                                    <span class="text-[10px] font-black uppercase tracking-widest {typeStyles[type].text}">
                                        {type}
                                    </span>
                                </div>
                                
                                {#if data.typeCounts && data.typeCounts[type] !== undefined}
                                    <span class="text-[9px] font-black text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                                        {data.typeCounts[type]}
                                    </span>
                                {/if}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            {#if showDuplicates && visibleCreatures.length > 0}
                <button 
                    onclick={() => isSellModalOpen = true}
                    in:scale={{ duration: 200 }}
                    class="w-full md:w-auto flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                >
                    <span class="text-[10px] font-black uppercase tracking-widest">
                        Sell All Duplicates
                    </span>
                </button>
            {/if}

        </div>
    </header>
    
    {#if visibleCreatures.length === 0}
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
            {#each visibleCreatures as creature (creature.id)}
                <div 
                    animate:flip={{ duration: 600, easing: quintOut }}
                    in:scale={{ duration: 300, start: 0.9 }}
                    class="group"
                >
                    <CreatureCard {creature} />
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

{#if isSellModalOpen}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
        transition:fade={{ duration: 200 }}
    >
        <div 
            class="bg-[#0A0A0A] border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(239,68,68,0.15)] relative overflow-hidden" 
            in:scale={{ start: 0.95, duration: 200, easing: quintOut }}
        >
            <div class="absolute -top-20 -right-20 w-40 h-40 bg-red-600/20 rounded-full blur-[50px] pointer-events-none"></div>

            <h2 class="text-2xl font-black text-white italic uppercase tracking-tighter mb-3">Bulk Release</h2>
            
            <p class="text-slate-400 text-sm mb-6 leading-relaxed font-medium">
                Are you sure you want to release 
                <strong class="text-white">{duplicateSummary.count} duplicate creatures</strong> 
                back to the wild? 
            </p>

            <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">How it works:</p>
                <ul class="text-[11px] text-slate-300 space-y-2 list-disc list-inside">
                    <li><span class="text-white">Newest duplicates</span> will be released.</li>
                    <li><span class="text-white">Oldest originals</span> will be kept.</li>
                    <li><span class="text-red-400">Favorited creatures</span> will be spared.</li>
                </ul>
            </div>

            <p class="text-white text-sm mb-8 font-black">
                You will receive a total of <span class="text-emerald-400">{duplicateSummary.gems} 💎</span>.
            </p>
            
            <div class="flex items-center gap-4">
                <button
                    onclick={() => isSellModalOpen = false}
                    disabled={isReleasing}
                    class="flex-1 py-3 px-4 rounded-xl font-black uppercase tracking-widest text-xs text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>

                <form
                    method="POST"
                    action="?/bulkRelease"
                    use:enhance={() => {
                        isReleasing = true;
                        return async ({ result, update }) => {
                            isReleasing = false;
                            isSellModalOpen = false;
                            
                            if (result.type === 'success') {
                                const count = result.data?.releasedCount || 0;
                                const gems = result.data?.gemsEarned || 0;
                                
                                if (count > 0) {
                                    alert(`Successfully released ${count} duplicates for ${gems} 💎!`);
                                    await reloadCollection();
                                } else {
                                    alert("No eligible duplicates found to release.");
                                }
                            } else {
                                alert("Failed to release creatures. Please try again.");
                            }
                            update();
                        };
                    }}
                    class="flex-1"
                >
                    <button
                        type="submit"
                        disabled={isReleasing}
                        class="w-full py-3 px-4 rounded-xl font-black uppercase tracking-widest text-xs text-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isReleasing ? 'Releasing...' : 'Confirm'}
                    </button>
                </form>
            </div>
        </div>
    </div>
{/if}

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