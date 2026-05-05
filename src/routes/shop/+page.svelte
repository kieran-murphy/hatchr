<script lang="ts">
    import { enhance } from '$app/forms';
    import { onMount, onDestroy } from 'svelte';
    import type { SubmitFunction } from '@sveltejs/kit';

    let { data, form } = $props();

    let isOpening = $state(false);
    let showRollingNumber = $state(false);
    let displayAmount = $state(0);
    
    let confettiGems = $state<{
        id: number, left: number, delay: number, duration: number, scale: number, startRot: number, endRot: number, drift: number
    }[]>([]);

    let lastClaimed = $state<Date | null>(data.lastChestClaimedAt ? new Date(data.lastChestClaimedAt) : null);
    let timeRemaining = $state('');
    let isCooldown = $state(false);
    let timerInterval: ReturnType<typeof setInterval>;
    
    // const COOLDOWN_MS = 12 * 60 * 60 * 1000;
    const COOLDOWN_MS = 20 * 1000;

    function updateTimer() {
        if (!lastClaimed) {
            isCooldown = false;
            return;
        }

        const now = new Date();
        const elapsed = now.getTime() - lastClaimed.getTime();
        const remaining = COOLDOWN_MS - elapsed;

        if (remaining <= 0) {
            isCooldown = false;
            timeRemaining = '';
            lastClaimed = null;
            if (timerInterval) clearInterval(timerInterval);
        } else {
            isCooldown = true;
            const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((remaining / 1000 / 60) % 60);
            const seconds = Math.floor((remaining / 1000) % 60);
            
            const mStr = minutes.toString().padStart(2, '0');
            const sStr = seconds.toString().padStart(2, '0');
            
            timeRemaining = `${hours}h ${mStr}m ${sStr}s`;
        }
    }

    onMount(() => {
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    });

    onDestroy(() => {
        if (timerInterval) clearInterval(timerInterval);
    });

    function animateCount(start: number, end: number, duration: number): Promise<void> {
        return new Promise((resolve) => {
            let startTime: number | null = null;

            function step(timestamp: number) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                
                // easeOutQuad easing for a nice slowdown effect at the end
                const easeOut = 1 - (1 - progress) * (1 - progress);
                displayAmount = Math.floor(easeOut * (end - start) + start);

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    resolve();
                }
            }
            window.requestAnimationFrame(step);
        });
    }

    const handleClaim: SubmitFunction = () => {
        isOpening = true;
        showRollingNumber = true;
        displayAmount = 0;

        return async ({ result, update }) => {
            await update();
            
            if (result.type === 'success' && result.data?.added) {
                const amountAdded = Number(result.data.added);
                
                if (result.data.claimedAt) {
                    lastClaimed = new Date(result.data.claimedAt as string);
                    updateTimer();
                    clearInterval(timerInterval);
                    timerInterval = setInterval(updateTimer, 1000);
                }

                // 1. Wait for the number to count up (1.5 seconds)
                await animateCount(0, amountAdded, 1500);

                // 2. THEN do the diamond animation
                const particleCount = Math.min(200, Math.max(30, Math.floor(amountAdded / 5)));
                confettiGems = Array.from({ length: particleCount }).map((_, i) => {
                    const startRot = Math.random() * 360;
                    return {
                        id: i,
                        left: Math.random() * 100,
                        // delay: Number((Math.random() * 0.3).toFixed(2)),
                        delay: 0,
                        duration: Number((Math.random() * 2.0 + 1.2).toFixed(2)), 
                        scale: Number((Math.random() * 0.8 + 0.6).toFixed(2)), 
                        startRot: startRot,
                        endRot: startRot + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 180 + 90),
                        drift: Math.random() * 30 - 15 
                    };
                });

                setTimeout(() => {
                    isOpening = false;
                    showRollingNumber = false;
                    confettiGems = [];
                }, 4500);
            } else {
                isOpening = false;
                showRollingNumber = false;
            }
        };
    };
</script>

<div class="max-w-4xl mx-auto py-16 px-6 relative">
    <header class="text-center mb-12">
        <h1 class="text-5xl font-black text-white italic tracking-tighter uppercase">The Gem Shop</h1>
        <p class="text-gray-500 mt-2 font-medium">Top up your balance to keep hatching!</p>
    </header>

    <div class="max-w-md mx-auto">
        <div class="bg-gray-900 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6 transition-all hover:border-blue-500/50 hover:bg-blue-500/5 relative"
             class:opacity-80={isCooldown}>
            
            {#if isOpening}
                <div class="absolute inset-0 bg-blue-500/20 blur-2xl z-0 rounded-3xl pointer-events-none animate-pulse"></div>
            {/if}

            <div class="text-7xl origin-center inline-block z-10"
                 class:chest-animating={isOpening}
                 class:grayscale={isCooldown}>
                🎁
            </div>
            
            <div class="text-center z-10">
                <h3 class="text-2xl font-bold text-white">Mystery Chest</h3>
                <p class="text-blue-400 font-black text-3xl mt-1">
                    {#if showRollingNumber}
                        {displayAmount} 💎
                    {:else}
                        ??? 💎
                    {/if}
                </p>
                <p class="text-gray-500 text-sm mt-2 font-medium">
                    {#if isCooldown}
                        Come back later for more!
                    {:else}
                        Amount is completely random!
                    {/if}
                </p>
            </div>

            <form method="POST" action="?/buyGems" use:enhance={handleClaim} class="w-full z-10 mt-2">
                <button 
                    disabled={isOpening || isCooldown}
                    class="w-full px-8 py-4 bg-white text-black text-lg font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           {!(isOpening || isCooldown) ? 'hover:bg-blue-500 hover:text-white cursor-pointer' : ''}
                           {isCooldown ? 'bg-gray-800 text-gray-400 border border-gray-700' : ''}">
                    
                    {#if isOpening}
                        OPENING...
                    {:else if isCooldown}
                        🔒 {timeRemaining}
                    {:else}
                        CLAIM FREE
                    {/if}
                </button>
            </form>
        </div>
    </div>

    {#if form?.success && !isOpening}
        <div class="mt-12 max-w-md mx-auto p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-center font-bold animate-pulse">
            Successfully added {form.added} gems to your account!
        </div>
    {/if}
</div>

{#if confettiGems.length > 0}
    <div class="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {#each confettiGems as gem (gem.id)}
            <div class="absolute text-4xl gem-particle"
                 style="
                    left: {gem.left}vw; 
                    --delay: {gem.delay}s;
                    --duration: {gem.duration}s;
                    --scale: {gem.scale};
                    --start-rot: {gem.startRot};
                    --end-rot: {gem.endRot};
                    --drift: {gem.drift};
                 ">
                💎
            </div>
        {/each}
    </div>
{/if}

<style>
    .chest-animating {
        animation: burst 0.7s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }

    @keyframes burst {
        0% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(59, 130, 246, 0)); }
        15% { transform: scale(1.2) rotate(-10deg); }
        30% { transform: scale(1.3) rotate(10deg); filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5)); }
        45% { transform: scale(1.2) rotate(-10deg); }
        60% { transform: scale(1.5) translateY(-10px); filter: drop-shadow(0 0 30px rgba(59, 130, 246, 1)); }
        100% { transform: scale(1) translateY(0); filter: drop-shadow(0 0 0px rgba(59, 130, 246, 0)); }
    }

    .gem-particle {
        top: -10vh; 
        animation: natural-fall var(--duration) ease-in forwards;
        animation-delay: var(--delay);
    }

    @keyframes natural-fall {
        0% { 
            top: -10vh; 
            transform: translateX(0) rotate(calc(var(--start-rot) * 1deg)) scale(var(--scale)); 
            opacity: 1; 
        }
        85% { 
            opacity: 1; 
        }
        100% { 
            top: 110vh; 
            transform: translateX(calc(var(--drift) * 1vw)) rotate(calc(var(--end-rot) * 1deg)) scale(var(--scale)); 
            opacity: 0; 
        }
    }
</style>