<script lang="ts">
    import { enhance } from '$app/forms';
    import { onMount, onDestroy } from 'svelte';
    import type { SubmitFunction } from '@sveltejs/kit';
    import { dev } from '$app/environment';

    let { data, form } = $props();

    // -- Tab State --
    let activeTab = $state<'small' | 'daily'>('small');

    // -- Cooldown Logic --
    const SMALL_COOLDOWN_MS = dev ? (10 * 1000) : (1 * 60 * 60 * 1000);   
    const DAILY_COOLDOWN_MS = dev ? (10 * 1000) : (24 * 60 * 60 * 1000);

    let smallTimer = $state('');
    let dailyTimer = $state('');
    let isSmallCooldown = $state(false);
    let isDailyCooldown = $state(false);
    let timerInterval: ReturnType<typeof setInterval>;

    function formatTime(remaining: number) {
        if (remaining <= 0) return '';
        const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remaining / 1000 / 60) % 60);
        const seconds = Math.floor((remaining / 1000) % 60);
        return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }

    function updateTimers() {
        const now = new Date().getTime();
        
        // Small Chest Timer
        if (data.lastChestClaimedAt) {
            const diff = now - new Date(data.lastChestClaimedAt).getTime();
            if (diff < SMALL_COOLDOWN_MS) {
                isSmallCooldown = true;
                smallTimer = formatTime(SMALL_COOLDOWN_MS - diff);
            } else { isSmallCooldown = false; }
        }

        // Daily Fortune Timer
        if (data.lastDailyRewardClaimedAt) {
            const diff = now - new Date(data.lastDailyRewardClaimedAt).getTime();
            if (diff < DAILY_COOLDOWN_MS) {
                isDailyCooldown = true;
                dailyTimer = formatTime(DAILY_COOLDOWN_MS - diff);
            } else { isDailyCooldown = false; }
        }
    }

    onMount(() => {
        updateTimers();
        timerInterval = setInterval(updateTimers, 1000);
    });

    onDestroy(() => clearInterval(timerInterval));

    // -- Animation State --
    let isOpening = $state(false);
    let showRollingNumber = $state(false);
    let displayAmount = $state(0);
    let confettiGems = $state<any[]>([]);

    async function animateCount(start: number, end: number, duration: number) {
        return new Promise<void>((resolve) => {
            let startTime: number | null = null;
            function step(timestamp: number) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const easeOut = 1 - (1 - progress) * (1 - progress);
                displayAmount = Math.floor(easeOut * (end - start) + start);
                if (progress < 1) window.requestAnimationFrame(step);
                else resolve();
            }
            window.requestAnimationFrame(step);
        });
    }

    const handleClaim: SubmitFunction = () => {
        isOpening = true;
        showRollingNumber = true;
        displayAmount = 0;

        const scrambleInterval = setInterval(() => {
            displayAmount = Math.floor(Math.random() * 999);
        }, 50);

        return async ({ result, update }) => {
            clearInterval(scrambleInterval);
            
            await update();
            if (result.type === 'success' && result.data?.added) {
                const amountAdded = Number(result.data.added);
                
                await animateCount(displayAmount, amountAdded, 1500);
                
                const particleCount = Math.min(140, Math.max(30, Math.floor(amountAdded / 6)));
                confettiGems = Array.from({ length: particleCount }).map((_, i) => ({
                    id: i, 
                    left: Math.random() * 100, 
                    duration: Math.random() * 2 + 1.5,
                    scale: Math.random() * 0.8 + 0.6,
                    drift: Math.random() * 20 - 10
                }));

                setTimeout(() => {
                    isOpening = false;
                    showRollingNumber = false;
                    confettiGems = [];
                }, 4000);
            } else {
                isOpening = false;
                showRollingNumber = false;
            }
        };
    };

</script>

<div class="max-w-md mx-auto py-16 px-6">
    <header class="text-center mb-12">
        <h1 class="text-5xl font-black text-white italic tracking-tighter uppercase">Gem Shop</h1>
    </header>

    <div class="flex p-1 bg-white/5 border border-white/10 rounded-2xl mb-8">
        <button 
            onclick={() => activeTab = 'small'}
            class="flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all {activeTab === 'small' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}"
        >
            Gem Chest
        </button>
        <button 
            onclick={() => activeTab = 'daily'}
            class="flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all {activeTab === 'daily' ? 'bg-yellow-500/20 text-yellow-500' : 'text-slate-400 hover:text-white'}"
        >
            Daily Fortune
        </button>
    </div>

    {#if activeTab === 'small'}
        <div class="bg-gray-900 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6" class:opacity-80={isSmallCooldown}>
            <div class="text-7xl">🎁</div>
            <div class="text-center">
                <h3 class="text-xl font-bold text-white">Gem Chest</h3>
                <p class="text-blue-400 font-black text-2xl mt-1">{showRollingNumber ? `${displayAmount} 💎` : 'Every 1 Hour'}</p>
            </div>
            <form method="POST" action="?/claimSmall" use:enhance={handleClaim} class="w-full">
                <button disabled={isOpening || isSmallCooldown} class="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-blue-500 hover:text-white disabled:opacity-50">
                    {isSmallCooldown ? `Locked: ${smallTimer}` : 'Claim Free'}
                </button>
            </form>
        </div>
    {:else}
        <div class="bg-gradient-to-b from-yellow-900/20 to-black border border-yellow-500/30 rounded-3xl p-8 flex flex-col items-center gap-6" class:opacity-80={isDailyCooldown}>
            <div class="text-7xl animate-bounce">✨</div>
            <div class="text-center">
                <h3 class="text-xl font-bold text-yellow-100">Daily Fortune</h3>
                <p class="text-yellow-400 font-black text-2xl mt-1">{showRollingNumber ? `${displayAmount} 💎` : 'Every 24 Hours'}</p>
            </div>
            <form method="POST" action="?/claimDaily" use:enhance={handleClaim} class="w-full">
                <button disabled={isOpening || isDailyCooldown} class="w-full py-4 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50">
                    {isDailyCooldown ? `Locked: ${dailyTimer}` : 'Claim Daily Fortune'}
                </button>
            </form>
        </div>
    {/if}
</div>

{#if confettiGems.length > 0}
    <div class="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {#each confettiGems as gem (gem.id)}
            <div class="absolute text-3xl gem-particle" 
                 style="left: {gem.left}vw; --duration: {gem.duration}s; --scale: {gem.scale}; --drift: {gem.drift}vw;">
                💎
            </div>
        {/each}
    </div>
{/if}

<style>
    .gem-particle {
        top: -10vh;
        animation: diamond-fall var(--duration) linear forwards;
    }
    @keyframes diamond-fall {
        to { 
            top: 110vh; 
            transform: translateY(0) translateX(var(--drift)) rotate(360deg) scale(var(--scale)); 
        }
    }
</style>