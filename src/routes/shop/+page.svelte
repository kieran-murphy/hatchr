<script lang="ts">
    import { enhance } from '$app/forms';
    let { data, form } = $props();

    const bundles = [
        { amount: 50, label: 'Pouch of Gems', price: 'FREE', icon: '💰' },
        { amount: 250, label: 'Chest of Gems', price: 'FREE', icon: '🎁' },
        { amount: 1000, label: 'Gem Vault', price: 'FREE', icon: '🏛️' }
    ];
</script>

<div class="max-w-4xl mx-auto py-16 px-6">
    <header class="text-center mb-12">
        <h1 class="text-5xl font-black text-white italic tracking-tighter uppercase">The Gem Shop</h1>
        <p class="text-gray-500 mt-2 font-medium">Top up your balance to keep hatching!</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each bundles as bundle}
            <div class="bg-gray-900 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4 transition-all hover:border-blue-500/50 hover:bg-blue-500/5">
                <span class="text-5xl">{bundle.icon}</span>
                
                <div class="text-center">
                    <h3 class="text-xl font-bold text-white">{bundle.label}</h3>
                    <p class="text-blue-400 font-black text-2xl">+{bundle.amount} 💎</p>
                </div>

                <form method="POST" action="?/buyGems" use:enhance>
                    <input type="hidden" name="amount" value={bundle.amount} />
                    <button class="w-full px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-blue-500 hover:text-white transition-colors">
                        CLAIM {bundle.price}
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