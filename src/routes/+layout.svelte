<script lang="ts">
    import './layout.css';
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';
    import { Menu, X, LogOut } from 'lucide-svelte/icons';

    let { children } = $props();

    let user = $derived($page.data.user);
    
    let isMobileMenuOpen = $state(false);
</script>

<div class="fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
    <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]"></div>
    <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]"></div>
</div>

<nav class="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        <a href="/" class="group flex items-center gap-1 text-2xl font-black tracking-tighter text-blue-500 transition-transform active:scale-95" onclick={() => isMobileMenuOpen = false}>
            HATCHR<span class="text-white group-hover:text-blue-400 transition-colors">.</span>
        </a>

        <div class="flex items-center">
            {#if user}
                <div class="hidden md:flex items-center gap-8">
                    <div class="flex items-center gap-6">
                        <a href="/hatch" class="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition">Hatch</a>
                        <a href="/" class="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition">Collection</a>
                        <a href="/shop" class="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition">Shop</a>
                        <a href="/users" class="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition">Users</a>
                    </div>

                    <div class="flex items-center gap-4 pl-8 border-l border-white/10">
                        <a href={`/profile/${user.id}`} class="text-sm font-bold text-gray-300 hover:text-white transition">
                            {user.name}
                        </a>

                        <form method="post" action="/demo/better-auth?/signOut" use:enhance>
                            <button class="p-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer" title="Sign Out">
                                <LogOut size={18} strokeWidth={2.5} />
                            </button>
                        </form>
                    </div>
                </div>

                <button 
                    class="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                    onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
                    aria-label="Toggle mobile menu"
                >
                    {#if isMobileMenuOpen}
                        <X size={24} />
                    {:else}
                        <Menu size={24} />
                    {/if}
                </button>
            {:else}
                <a href="/demo/better-auth/login" class="text-sm font-bold text-white bg-blue-600 px-6 py-2 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                    Login
                </a>
            {/if}
        </div>
    </div>

    {#if isMobileMenuOpen && user}
        <div class="absolute top-full left-0 w-full border-b border-white/5 bg-[#0A0A0A]/95 backdrop-blur-2xl md:hidden">
            <div class="flex flex-col px-6 py-6 space-y-6">
                <div class="flex flex-col space-y-4">
                    <a href="/hatch" onclick={() => isMobileMenuOpen = false} class="text-lg font-black uppercase tracking-widest text-gray-400 hover:text-white transition active:scale-95 origin-left">Hatch</a>
                    <a href="/" onclick={() => isMobileMenuOpen = false} class="text-lg font-black uppercase tracking-widest text-gray-400 hover:text-white transition active:scale-95 origin-left">Collection</a>
                    <a href="/shop" onclick={() => isMobileMenuOpen = false} class="text-lg font-black uppercase tracking-widest text-gray-400 hover:text-white transition active:scale-95 origin-left">Shop</a>
                    <a href="/users" onclick={() => isMobileMenuOpen = false} class="text-lg font-black uppercase tracking-widest text-gray-400 hover:text-white transition active:scale-95 origin-left">Users</a>
                </div>
                
                <div class="pt-6 mt-2 border-t border-white/10 flex items-center justify-between">
                    <a href={`/profile/${user.id}`} onclick={() => isMobileMenuOpen = false} class="text-sm font-bold text-blue-400 hover:text-blue-300 transition uppercase tracking-widest">
                        My Profile
                    </a>

                    <form method="post" action="/demo/better-auth?/signOut" use:enhance onsubmit={() => isMobileMenuOpen = false}>
                        <button class="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-widest hover:bg-red-500/20 transition-colors">
                            <LogOut size={14} strokeWidth={3} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    {/if}
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