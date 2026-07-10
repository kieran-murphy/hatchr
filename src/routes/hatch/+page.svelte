<script lang="ts">
    import { enhance } from '$app/forms';
    import { scale, fade } from 'svelte/transition';
    import { elasticOut } from 'svelte/easing';
    import { resolve } from '$app/paths';
    import { typeStyles } from '$lib/game'; 
    import { Loader2, ChevronDown } from '@lucide/svelte';
    
    let { data, form } = $props();
    
    let isMenuOpen = $state(false);
    let hatching = $state(false);
    let hatchTier = $state<'single' | 'dual' | 'new'>('single');

    // --- COOLDOWN LOGIC ---
    const COOLDOWN_MS = 24 * 60 * 60 * 1000;
    
    // Reactive clock
    let now = $state(Date.now());
    $effect(() => {
        const interval = setInterval(() => { now = Date.now(); }, 1000);
        return () => clearInterval(interval);
    });

    // Calculate time remaining
    let lastClaimed = $derived(data.user?.lastNewHatchClaimedAt?.getTime() || 0);
    let msRemaining = $derived(Math.max(0, (lastClaimed + COOLDOWN_MS) - now));
    let isReady = $derived(msRemaining === 0);

    // Your nice game-style time formatter
    function formatTime(remaining: number) {
        if (remaining <= 0) return '';
        const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remaining / 1000 / 60) % 60);
        const seconds = Math.floor((remaining / 1000) % 60);
        return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }

    let formattedTime = $derived.by(() => {
        if (isReady) return "Ready!";
        return formatTime(msRemaining);
    });

    const rarityStyles: Record<string, string> = {
        COMMON: 'text-gray-400 border-gray-400/20 bg-gray-400/5 shadow-[0_0_20px_rgba(156,163,175,0.1)]',
        UNCOMMON: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5 shadow-[0_0_35px_rgba(52,211,153,0.3)]',
        RARE: 'text-blue-400 border-blue-400/20 bg-blue-400/5 shadow-[0_0_50px_rgba(37,99,235,0.5)]',
        LEGENDARY: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10 shadow-[0_0_80px_rgba(250,204,21,0.8),inset_0_0_30px_rgba(250,204,21,0.5)] animate-pulse'
    };

    const tiers = [
        { id: 'single', label: 'Single (100 💎)', style: 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' },
        { id: 'dual', label: 'Dual (200 💎)', style: 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' },
        { id: 'new', label: 'New (1000 💎)', style: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)]' }
    ];

    let selectedTier = $derived(tiers.find(t => t.id === hatchTier));

    const getSplashColor = (rarity: string) => {
        switch(rarity) {
            case 'LEGENDARY': return 'border-yellow-400 text-yellow-400';
            case 'RARE': return 'border-blue-400 text-blue-400';
            case 'UNCOMMON': return 'border-emerald-400 text-emerald-400';
            default: return 'border-gray-400 text-gray-400';
        }
    };
</script>

<div class="flex flex-col items-center justify-center min-h-[80vh] gap-8 p-6 w-full max-w-[100vw] overflow-x-hidden">
    <div class="flex flex-col items-center gap-4">
        <div class="px-5 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-3">
            <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Balance</span>
            <span class="text-xl font-mono font-bold text-blue-400">{data.userGems?.toLocaleString() ?? 0} 💎</span>
        </div>
    </div>

    <div class="relative w-full max-w-[280px]">
        <button 
            onclick={() => isMenuOpen = !isMenuOpen}
            disabled={hatching}
            class="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase text-white transition-all hover:bg-white/10"
        >
            <span>{selectedTier?.label || 'Select Tier'}</span>
            <ChevronDown size={16} class="transition-transform {isMenuOpen ? 'rotate-180' : ''}" />
        </button>

        {#if isMenuOpen}
            <div 
                transition:fade={{ duration: 200 }} 
                class="absolute top-full left-0 z-50 mt-2 w-full flex flex-col gap-1 rounded-xl border border-white/10 bg-[#0A0A0A] p-1 shadow-2xl"
            >
                {#each tiers as tier (tier.id)}
                    <button 
                        onclick={() => { 
                            hatchTier = tier.id; 
                            isMenuOpen = false; 
                        }}
                        class="w-full rounded-lg px-4 py-3 text-left text-xs font-black uppercase transition-all 
                            {hatchTier === tier.id 
                                ? `${tier.style} ring-1 ring-white/20` 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'}"
                    >
                        {tier.label}
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    {#if isMenuOpen}
        <div class="fixed inset-0 z-40" onclick={() => isMenuOpen = false} role="button" aria-label="Close menu"></div>
    {/if}

    <div class="min-h-[300px] grid place-items-center relative">
        
        {#if form?.success && !hatching}
            <div 
                in:scale={{ duration: 800, start: 0.5, easing: elasticOut }} 
                out:fade={{ duration: 200 }} 
                class="col-start-1 row-start-1 flex flex-col items-center gap-6 relative"
            >
                <div class={`pointer-events-none absolute inset-0 top-[-20px] rounded-full animate-splash ${getSplashColor(form.creature.rarity)}`}></div>

                <div class="relative group z-10">
                    <div class="absolute inset-0 rounded-3xl {rarityStyles[form.creature.rarity].split(' ').find(c => c.startsWith('shadow-')) || ''} blur-xl transition-all duration-500"></div>
                    
                    <img 
                        src={form.creature.imageUrl} 
                        alt="New Creature" 
                        class="relative z-10 w-56 h-56 object-cover rounded-3xl bg-black/80 border-2 border-white/10 p-2 transition-transform duration-500 hover:scale-105"
                    />

                    {#if form.isNewCombo}
                        <div class="absolute -top-4 -right-4 z-30 flex items-center justify-center overflow-hidden rounded-full border-2 border-white/90 bg-slate-600 px-4 py-1 text-sm font-black tracking-widest text-white shadow-[0_0_20px_rgba(220,38,38,0.8)] rotate-12">
                            <span class="relative z-10 drop-shadow-md">NEW!</span>
                            
                            <div class="absolute top-0 left-0 h-full w-8 -translate-x-[200%] -skew-x-[30deg] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1px] animate-shine"></div>
                        </div>
                    {/if}

                    <div class="absolute z-20 -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/20 shadow-xl flex items-center gap-2">
                        <span class="text-[11px] font-black uppercase tracking-tighter {rarityStyles[form.creature.rarity].split(' ')[0]}">
                            {form.creature.rarity}
                        </span>
                    </div>
                </div>

                <div class="text-center mt-2 space-y-3 z-10 relative px-4 w-full max-w-sm">
                    <h2 class="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg break-words">
                        {form.creature.speciesName}
                    </h2>
                    
                    <div class="flex justify-center gap-2">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md {typeStyles[form.creature.type1]?.text || 'text-gray-300'}">
                            <div class="w-1.5 h-1.5 rounded-full {typeStyles[form.creature.type1]?.dot || 'bg-gray-400'}"></div>
                            {form.creature.type1}
                        </span>
                        
                        {#if form.creature.type2}
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md {typeStyles[form.creature.type2]?.text || 'text-gray-300'}">
                                <div class="w-1.5 h-1.5 rounded-full {typeStyles[form.creature.type2]?.dot || 'bg-gray-400'}"></div>
                                {form.creature.type2}
                            </span>
                        {/if}
                    </div>

                    <a href={resolve(`/profile/${data.userId}/collection`)} class="inline-block text-xs text-blue-500/60 hover:text-blue-400 transition-colors uppercase font-bold tracking-widest mt-2">
                        View in Collection →
                    </a>
                </div>
            </div>
            
        {:else if hatching}
            <div in:fade class="col-start-1 row-start-1 text-9xl origin-bottom animate-crack">
                🥚
            </div>
            
        {:else}
            <div class="col-start-1 row-start-1 text-white/10 text-9xl italic font-black select-none transition-all hover:scale-105 hover:text-white/20">?</div>
        {/if}
        
    </div>
    <form 
        method="POST" 
        action={hatchTier === 'new' ? '?/hatchNew' : '?/hatchRegular'}
        use:enhance={() => {
            hatching = true;
            return async ({ update }) => {
                if (hatchTier !== 'new') {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
                await update({ reset: false }); 
                hatching = false;
            };
        }}
        class="w-full max-w-sm"
    >
        <input type="hidden" name="tier" value={hatchTier} />
        
        {#if hatchTier === 'new' && !isReady}
        <div class="flex w-full cursor-not-allowed flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0A0A0A]/80 px-8 py-5 text-center shadow-inner">
            <span class="text-xs font-black uppercase tracking-widest text-emerald-500/50">
                Incubator Charging
            </span>
            <span class="mt-2 font-mono text-3xl font-black text-gray-400">
                {formattedTime} </span>
            <span class="mt-2 text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                Until next guaranteed new hatch
            </span>
        </div>
    {:else}
        <button 
            disabled={!isReady || hatching || data.userGems < (hatchTier === 'new' ? 1000 : hatchTier === 'dual' ? 200 : 100)}
            class="flex items-center justify-center group relative w-full py-5 
            {hatchTier === 'new' ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_0_20px_rgba(16,185,129,0.6)]' 
            : hatchTier === 'dual' ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
            : 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]'} 
            rounded-2xl font-black text-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer"
        >
            <span class="relative z-10 flex items-center gap-3 text-white">
                {#if hatching}
                    <div class="flex items-center gap-2">
                        <Loader2 class="animate-spin" size={20} />
                        <span>CRACKING...</span>
                    </div>
                {:else}
                    <span>🥚</span> HATCH
                {/if}
            </span>
            
            <div class="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
        </button>
    {/if}
    </form>

    {#if form?.message && !form?.success}
        <p class="text-red-400 font-medium bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20 animate-pulse">
            {form.message}
        </p>
    {/if}
</div>

<style>
    @keyframes crack-intensity {
        0%, 100% { 
            transform: translate(1px, 1px) rotate(0deg) scale(1); 
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4)) brightness(1); 
        }
        10% { transform: translate(-1px, -2px) rotate(-5deg) scale(1.02); }
        20% { transform: translate(-3px, 0px) rotate(5deg) scale(1.05); }
        30% { transform: translate(3px, 2px) rotate(0deg) scale(1.05); }
        40% { transform: translate(1px, -1px) rotate(5deg) scale(1.05); }
        50% { 
            transform: translate(-1px, 2px) rotate(-5deg) scale(1.05); 
            filter: drop-shadow(0 0 40px rgba(255, 255, 255, 1)) drop-shadow(0 0 100px rgba(125, 211, 252, 0.8)) brightness(1.6); 
        }
        60% { transform: translate(-3px, 1px) rotate(0deg) scale(1.05); }
        70% { transform: translate(3px, 1px) rotate(-5deg) scale(1.05); }
        80% { transform: translate(-1px, -1px) rotate(5deg) scale(1.02); }
        90% { transform: translate(1px, 2px) rotate(0deg) scale(1); }
    }

    @keyframes splash-ring {
        0% { 
            transform: scale(0.2); 
            opacity: 1; 
            border-width: 50px; 
            border-style: solid;
            box-shadow: 0 0 50px currentColor, inset 0 0 50px currentColor;
        }
        100% { 
            transform: scale(2.5); 
            opacity: 0; 
            border-width: 0px; 
            border-style: solid;
            box-shadow: 0 0 10px currentColor, inset 0 0 10px currentColor;
        }
    }

    @keyframes foil-shine {
        0% { 
            transform: translateX(-200%) skewX(-30deg); 
            opacity: 0; 
        }
        10% { 
            opacity: 1; 
        }
        80% { 
            opacity: 1; 
        }
        100% { 
            transform: translateX(400%) skewX(-30deg); 
            opacity: 0; 
        }
    }

    .animate-shine {
        animation: foil-shine 2s ease-in-out infinite;
    }

    .animate-crack {
        animation: crack-intensity 0.6s cubic-bezier(.36,.07,.19,.97) infinite;
    }

    .animate-splash {
        animation: splash-ring 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
</style>