<script lang="ts">
    import './layout.css';
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';

    let { children } = $props();

    let user = $derived($page.data.user);
</script>

<nav class="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md px-6 py-4">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
        <a href="/" class="text-xl font-bold tracking-tighter text-blue-500">
            HATCHR<span class="text-white">.</span>
        </a>

        <div class="flex items-center gap-6">
            <a href="/" class="text-sm font-medium text-gray-400 hover:text-white transition">Home</a>
            
            {#if user}
                <a href="/hatch" class="text-sm font-medium text-gray-400 hover:text-white transition">Hatch</a>

                <a href="/collection" class="text-sm font-medium text-gray-400 hover:text-white transition">Collection</a>

                <a href="/profile" class="text-sm font-medium text-gray-400 hover:text-white transition">{user.name}</a>

                <form method="post" action="/demo/better-auth?/signOut" use:enhance>
                    <button class="text-sm font-medium text-gray-400 hover:text-red-400 transition">
                        Sign Out
                    </button>
                </form>
            {:else}
                <a href="/demo/better-auth/login" class="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Login
                </a>
            {/if}
        </div>
    </div>
</nav>

<main>
    {@render children()}
</main>