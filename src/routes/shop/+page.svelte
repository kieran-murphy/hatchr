<script lang="ts">
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';

    let { data, form } = $props();

    let openingAmount = $state<number | null>(null);
    let confettiGems = $state<{
        id: number, 
        left: number, 
        delay: number, 
        duration: number,
        scale: number,
        startRot: number,
        endRot: number,
        drift: number
    }[]>([]);

    const bundles = [
        { amount: 50, label: 'Bag of Gems', price: 'FREE', icon: '💰' },
        { amount: 250, label: 'Box of Gems', price: 'FREE', icon: '🎁' },
        { amount: 1000, label: 'Bank of Gems', price: 'FREE', icon: '🏛️' }
    ];

    const handleClaim: SubmitFunction = ({ formData }) => {
        const amount = Number(formData.get('amount'));
        openingAmount = amount;

        const particleCount = Math.min(200, Math.max(30, Math.floor(amount / 5)));

        confettiGems = Array.from({ length: particleCount }).map((_, i) => {
            const startRot = Math.random() * 360;
            return {
                id: i,
                left: Math.random() * 100,
                // Reduced max delay by 20% (from 1.5s to 1.2s)
                delay: Number((Math.random() * 1.2).toFixed(2)),
                // Reduced fall duration by 20% (from 1.5s-4s to 1.2s-3.2s)
                duration: Number((Math.random() * 2.0 + 1.2).toFixed(2)), 
                scale: Number((Math.random() * 0.8 + 0.6).toFixed(2)), 
                startRot: startRot,
                endRot: startRot + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 180 + 90),
                drift: Math.random() * 30 - 15 
            };
        });

        return async ({ update }) => {
            await update();
            
            // Reduced cleanup wait time to match the new max animation length (1.2 + 3.2 = 4.4s)
            setTimeout(() => {
                openingAmount = null;
                confettiGems = [];
            }, 4000);
        };
    };
</script>

<div class="max-w-4xl mx-auto py-16 px-6 relative">
    <header class="text-center mb-12">
        <h1 class="text-5xl font-black text-white italic tracking-tighter uppercase">The Gem Shop</h1>
        <p class="text-gray-500 mt-2 font-medium">Top up your balance to keep hatching!</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each bundles as bundle (bundle.amount)}
            <div class="bg-gray-900 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4 transition-all hover:border-blue-500/50 hover:bg-blue-500/5 relative">
                
                {#if openingAmount === bundle.amount}
                    <div class="absolute inset-0 bg-blue-500/20 blur-2xl z-0 rounded-3xl pointer-events-none animate-pulse"></div>
                {/if}

                <div class="text-5xl origin-center inline-block z-10"
                     class:chest-animating={openingAmount === bundle.amount}>
                    {bundle.icon}
                </div>
                
                <div class="text-center z-10">
                    <h3 class="text-xl font-bold text-white">{bundle.label}</h3>
                    <p class="text-blue-400 font-black text-2xl">+{bundle.amount} 💎</p>
                </div>

                <form method="POST" action="?/buyGems" use:enhance={handleClaim} class="w-full z-10">
                    <input type="hidden" name="amount" value={bundle.amount} />
                    <button 
                        disabled={openingAmount !== null}
                        class="w-full px-8 py-3 bg-white text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                               {openingAmount === null ? 'hover:bg-blue-500 hover:text-white cursor-pointer' : ''}">
                        {#if openingAmount === bundle.amount}
                            OPENING...
                        {:else}
                            CLAIM {bundle.price}
                        {/if}
                    </button>
                </form>
            </div>
        {/each}
    </div>

    {#if form?.success}
        <div class="mt-12 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-center font-bold animate-pulse">
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
    /* Sped up the chest burst from 0.8s to 0.6s */
    .chest-animating {
        animation: burst 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
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