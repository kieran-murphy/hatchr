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
    type ChestState = 'idle' | 'shaking' | 'burst';
    let chestState = $state<ChestState>('idle');
    let isOpening = $state(false);
    let showRollingNumber = $state(false);
    let displayAmount = $state(0);
    let pulseNumber = $state(false);
    let showFlash = $state(false);
    let confettiGems = $state<
        { id: number; emoji: string; bx: number; by: number; drift: number; rotation: number; duration: number; delay: number; scale: number }[]
    >([]);

    const PARTICLE_EMOJIS = ['💎', '💎', '💎', '✨', '⭐'];

    function spawnParticles(amountAdded: number) {
        const particleCount = Math.min(140, Math.max(30, Math.floor(amountAdded / 6)));
        confettiGems = Array.from({ length: particleCount }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const burstDist = 50 + Math.random() * 150;
            return {
                id: i + Date.now(),
                emoji: PARTICLE_EMOJIS[Math.floor(Math.random() * PARTICLE_EMOJIS.length)],
                bx: Math.cos(angle) * burstDist,
                by: Math.sin(angle) * burstDist * 0.55 - 30,
                drift: Math.random() * 60 - 30,
                rotation: Math.random() * 720 - 360,
                duration: Math.random() * 1.3 + 1.7,
                delay: Math.random() * 0.12,
                scale: Math.random() * 0.7 + 0.6
            };
        });
    }

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
        chestState = 'shaking';
        showRollingNumber = false;
        displayAmount = 0;

        const shakeStart = Date.now();
        const MIN_SHAKE_MS = 550;

        return async ({ result, update }) => {
            await update();

            const elapsed = Date.now() - shakeStart;
            if (elapsed < MIN_SHAKE_MS) {
                await new Promise((r) => setTimeout(r, MIN_SHAKE_MS - elapsed));
            }

            if (result.type === 'success' && result.data?.added) {
                const amountAdded = Number(result.data.added);

                chestState = 'burst';
                showFlash = true;
                setTimeout(() => (showFlash = false), 500);
                spawnParticles(amountAdded);

                showRollingNumber = true;
                const scrambleInterval = setInterval(() => {
                    displayAmount = Math.floor(Math.random() * amountAdded);
                }, 45);

                setTimeout(async () => {
                    clearInterval(scrambleInterval);
                    await animateCount(displayAmount, amountAdded, 900);
                    pulseNumber = true;
                    setTimeout(() => (pulseNumber = false), 400);
                }, 500);

                setTimeout(() => {
                    isOpening = false;
                    chestState = 'idle';
                    showRollingNumber = false;
                    confettiGems = [];
                }, 4200);
            } else {
                chestState = 'idle';
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
            Gem Box
        </button>
        <button
            onclick={() => activeTab = 'daily'}
            class="flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all {activeTab === 'daily' ? 'bg-yellow-500/20 text-yellow-500' : 'text-slate-400 hover:text-white'}"
        >
            Gem Bank
        </button>
    </div>

    {#if activeTab === 'small'}
        <div class="bg-gray-900 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6" class:opacity-80={isSmallCooldown}>
            <div class="chest-anchor text-blue-400">
                {#if chestState === 'burst'}<div class="shockwave"></div>{/if}
                <div class="text-7xl" class:chest-shake={chestState === 'shaking'} class:chest-pop={chestState === 'burst'}>🎁</div>
            </div>
            <div class="text-center">
                <h3 class="text-xl font-bold text-white">Gem Box</h3>
                <p class="text-blue-400 font-black text-2xl mt-1">
                    {#if showRollingNumber}<span class:number-pop={pulseNumber}>{displayAmount} 💎</span>{:else}Every 1 Hour{/if}
                </p>
            </div>
            <form method="POST" action="?/claimSmall" use:enhance={handleClaim} class="w-full">
                <button disabled={isOpening || isSmallCooldown} class="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-blue-500 hover:text-white disabled:opacity-50 transition-colors">
                    {isSmallCooldown ? `Locked: ${smallTimer}` : (isOpening ? 'Opening...' : 'Claim Free')}
                </button>
            </form>
        </div>
    {:else}
        <div class="bg-gradient-to-b from-yellow-900/20 to-black border border-yellow-500/30 rounded-3xl p-8 flex flex-col items-center gap-6" class:opacity-80={isDailyCooldown}>
            <div class="chest-anchor text-yellow-400">
                {#if chestState === 'burst'}<div class="shockwave"></div>{/if}
                <div
                    class="text-7xl"
                    class:animate-bounce={chestState === 'idle'}
                    class:chest-shake={chestState === 'shaking'}
                    class:chest-pop={chestState === 'burst'}
                >🏛️</div>
            </div>
            <div class="text-center">
                <h3 class="text-xl font-bold text-yellow-100">Gem Bank</h3>
                <p class="text-yellow-400 font-black text-2xl mt-1">
                    {#if showRollingNumber}<span class:number-pop={pulseNumber}>{displayAmount} 💎</span>{:else}Every 24 Hours{/if}
                </p>
            </div>
            <form method="POST" action="?/claimDaily" use:enhance={handleClaim} class="w-full">
                <button disabled={isOpening || isDailyCooldown} class="w-full py-4 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50 transition-colors">
                    {isDailyCooldown ? `Locked: ${dailyTimer}` : (isOpening ? 'Opening...' : 'Claim from Gem Bank')}
                </button>
            </form>
        </div>
    {/if}
</div>

{#if showFlash}
    <div class="fixed inset-0 pointer-events-none z-95 flash-overlay"></div>
{/if}

{#if confettiGems.length > 0}
    <div class="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {#each confettiGems as gem (gem.id)}
            <div
                class="absolute text-3xl gem-particle"
                style="
                    top: 40vh; left: 50vw;
                    --bx: {gem.bx}px; --by: {gem.by}px; --drift: {gem.drift}px;
                    --rot: {gem.rotation}deg; --scale: {gem.scale};
                    --duration: {gem.duration}s; --delay: {gem.delay}s;
                "
            >
                {gem.emoji}
            </div>
        {/each}
    </div>
{/if}

<style>
    /* Windup shake before the reward lands */
    .chest-shake {
        animation: chest-shake 0.45s ease-in-out infinite;
    }
    @keyframes chest-shake {
        0%, 100% { transform: rotate(0deg) translateX(0); }
        20% { transform: rotate(-8deg) translateX(-3px); }
        40% { transform: rotate(7deg) translateX(3px); }
        60% { transform: rotate(-6deg) translateX(-2px); }
        80% { transform: rotate(5deg) translateX(2px); }
    }

    /* Pop when the reward reveals */
    .chest-pop {
        animation: chest-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes chest-pop {
        0% { transform: scale(0.7) rotate(0deg); }
        50% { transform: scale(1.35) rotate(8deg); }
        100% { transform: scale(1) rotate(0deg); }
    }

    .chest-anchor {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .shockwave {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-radius: 9999px;
        border: 3px solid currentColor;
        opacity: 0.85;
        transform: translate(-50%, -50%);
        animation: shockwave-expand 0.7s ease-out forwards;
    }
    @keyframes shockwave-expand {
        to {
            width: 240px;
            height: 240px;
            opacity: 0;
        }
    }

    .flash-overlay {
        background: radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.35), transparent 60%);
        animation: flash-fade 0.5s ease-out forwards;
    }
    @keyframes flash-fade {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    .number-pop {
        display: inline-block;
        animation: number-pop 0.4s ease-out;
    }
    @keyframes number-pop {
        0% { transform: scale(1); }
        45% { transform: scale(1.35); }
        100% { transform: scale(1); }
    }

    /* Burst outward from the chest, then fall and fade */
    .gem-particle {
        animation: gem-burst var(--duration) var(--delay) cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
    }
    @keyframes gem-burst {
        0% {
            transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
            opacity: 1;
        }
        18% {
            transform: translate(calc(-50% + var(--bx)), calc(-50% + var(--by))) scale(var(--scale)) rotate(calc(var(--rot) * 0.3));
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% + var(--bx) + var(--drift)), 70vh) scale(var(--scale)) rotate(var(--rot));
            opacity: 0;
        }
    }
</style>
