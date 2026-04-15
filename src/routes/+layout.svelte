<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Hatchr</title>
</svelte:head>

<nav class="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md px-6 py-4">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
        <a href="/" class="text-xl font-bold tracking-tighter text-blue-500 hover:opacity-80 transition">
            HATCHR<span class="text-white">.</span>
        </a>

        <div class="flex gap-8">
            <a href="/" class="text-sm font-medium text-gray-400 hover:text-white transition">Home</a>
            <a href="/demo/better-auth/login" class="text-sm font-medium text-gray-400 hover:text-white transition">Login</a>
        </div>
    </div>
</nav>

<main class="min-h-screen bg-[#050505] text-white">
    {@render children()}
</main>

<style>
    a {
        text-decoration: none;
    }
</style>