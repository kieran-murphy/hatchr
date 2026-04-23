<script lang="ts">
    import './layout.css';
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';

    let { children } = $props();

    let user = $derived($page.data.user);
</script>

<div class="fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
    <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]"></div>
    <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]"></div>
</div>

<nav class="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 py-3">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
        <a href="/" class="group flex items-center gap-1 text-2xl font-black tracking-tighter text-blue-500 transition-transform active:scale-95">
            HATCHR<span class="text-white group-hover:text-blue-400 transition-colors">.</span>
        </a>

        <div class="flex items-center gap-2 md:gap-8">
            {#if user}
                <div class="hidden md:flex items-center gap-6">
                    <a href="/shop" class="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition">Shop</a>
                    <a href="/hatch" class="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition">Hatch</a>
                    <a href="/collection" class="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition">Collection</a>
                </div>

                <div class="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full shadow-inner">
                    <span class="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Gems</span>
                    <span class="font-mono font-bold text-white leading-none">
                        {user.gems?.toLocaleString() ?? 0}
                    </span>
                </div>

                <div class="flex items-center gap-4 pl-4 border-l border-white/10">
                    <a href="/profile" class="text-sm font-bold text-gray-300 hover:text-white transition">
                        {user.name}
                    </a>

                    <form method="post" action="/demo/better-auth?/signOut" use:enhance>
                        <button class="p-2 text-gray-500 hover:text-red-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        </button>
                    </form>
                </div>
            {:else}
                <a href="/demo/better-auth/login" class="text-sm font-bold text-white bg-blue-600 px-6 py-2 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                    Login
                </a>
            {/if}
        </div>
    </div>
</nav>

<main class="relative">
    {@render children()}
</main>

<style>
    :global(html) {
        scroll-behavior: smooth;
        color-scheme: dark;
    }
</style>