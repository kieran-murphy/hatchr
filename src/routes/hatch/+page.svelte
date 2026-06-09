<script lang="ts">
    import { enhance } from '$app/forms';
    import { scale, fade } from 'svelte/transition';
    import { elasticOut } from 'svelte/easing';
    import { resolve } from '$app/paths';
    
    let { data, form } = $props();
    
    let hatching = $state(false);
    let isDual = $state(false);

    const rarityStyles = {
        COMMON: 'text-gray-400 border-gray-400/20 bg-gray-400/5 shadow-[0_0_20px_rgba(156,163,175,0.1)]',
        UNCOMMON: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5 shadow-[0_0_35px_rgba(52,211,153,0.3)]',
        RARE: 'text-blue-400 border-blue-400/20 bg-blue-400/5 shadow-[0_0_50px_rgba(37,99,235,0.5)]',
        LEGENDARY: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10 shadow-[0_0_80px_rgba(250,204,21,0.8),inset_0_0_30px_rgba(250,204,21,0.5)] animate-pulse'
    };

    const getSplashColor = (rarity: string) => {
        switch(rarity) {
            case 'LEGENDARY': return 'border-yellow-400 text-yellow-400';
            case 'RARE': return 'border-blue-400 text-blue-400';
            case 'UNCOMMON': return 'border-emerald-400 text-emerald-400';
            default: return 'border-gray-400 text-gray-400';
        }
    };
</script>

<div class="flex flex-col items-center justify-center min-h-[80vh] gap-8 p-6">
    <div class="flex flex-col items-center gap-4">
        <div class="px-5 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-3">
            <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Balance</span>
            <span class="text-xl font-mono font-bold text-blue-400">{data.userGems?.toLocaleString() ?? 0} 💎</span>
        </div>
    </div>

    <div class="flex bg-white/5 p-1 rounded-2xl border border-white/5">
        <button 
            onclick={() => isDual = false}
            disabled={hatching}
            class="px-6 py-3 rounded-xl font-black text-xs uppercase transition-all {!isDual ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}"
        >
            Single (100 💎)
        </button>
        <button 
            onclick={() => isDual = true}
            disabled={hatching}
            class="px-6 py-3 rounded-xl font-black text-xs uppercase transition-all {isDual ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'text-gray-500 hover:text-white'}"
        >
            Dual (200 💎)
        </button>
    </div>

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
                    <div class="absolute z-20 -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/20 shadow-xl flex items-center gap-2">
                        <span class="text-[11px] font-black uppercase tracking-tighter {rarityStyles[form.creature.rarity].split(' ')[0]}">
                            {form.creature.rarity}
                        </span>
                    </div>
                </div>

                <div class="text-center mt-2 space-y-2 z-10 relative">
                    <h2 class="text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg">{form.creature.speciesName}</h2>
                    
                    <div class="flex justify-center gap-2">
                        <span class="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-gray-300 uppercase tracking-wider">{form.creature.type1}</span>
                        {#if form.creature.type2}
                            <span class="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-gray-300 uppercase tracking-wider">{form.creature.type2}</span>
                        {/if}
                    </div>

                    <a href={resolve(`/profile/${data.userId}/collection`)} class="inline-block text-xs text-blue-500/60 hover:text-blue-400 transition-colors uppercase font-bold tracking-widest mt-2">
                        View in Collection →
                    </a>
                </div>
            </div>
            
        {:else if hatching}
            <div in:fade class="col-start-1 row-start-1 text-9xl origin-bottom animate-crack">🥚</div>
            
        {:else}
            <div class="col-start-1 row-start-1 text-white/10 text-9xl italic font-black select-none transition-all hover:scale-105 hover:text-white/20">?</div>
        {/if}
        
    </div>

    <form 
        method="POST" 
        use:enhance={() => {
            hatching = true;
            return async ({ update }) => {
                await new Promise(resolve => setTimeout(resolve, 1500));
                await update({ reset: false }); 
                hatching = false;
            };
        }}
    >
        <input type="hidden" name="isDual" value={isDual.toString()} />
        <button 
            disabled={hatching || data.userGems < (isDual ? 200 : 100)}
            class="group relative px-14 py-5 {isDual ? 'bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]'} rounded-2xl font-black text-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer"
        >
            <span class="relative z-10 flex items-center gap-3 text-white">
                {#if hatching}
                    CRACKING...
                {:else}
                    <span>🥚</span> HATCH
                {/if}
            </span>
            
            <div class="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
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

    .animate-crack {
        animation: crack-intensity 0.6s cubic-bezier(.36,.07,.19,.97) infinite;
    }

    .animate-splash {
        animation: splash-ring 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
</style>