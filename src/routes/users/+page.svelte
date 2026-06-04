<script lang="ts">
    import { resolve } from '$app/paths';

    let searchQuery = $state('');
    let results = $state<{ id: string, username: string, creatures: number, image: string | null }[]>([]);
    let isSearching = $state(false);

    let debounceTimer: ReturnType<typeof setTimeout>;

    $effect(() => {
        const q = searchQuery.trim();
        
        if (q.length < 2) {
            results = [];
            isSearching = false;
            return;
        }

        isSearching = true;
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
                if (res.ok) {
                    results = await res.json();
                } else {
                    results = [];
                }
            } catch (error) {
                console.error(error);
                results = [];
            } finally {
                isSearching = false;
            }
        }, 300);
    });
</script>

<div class="max-w-xl mx-auto py-12 px-6">
    <div class="relative">
        <div class="relative z-10">
            <input 
                type="text" 
                bind:value={searchQuery}
                placeholder="Search for users..." 
                class="w-full bg-gray-900 border border-white/20 text-white placeholder-gray-500 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
            
            {#if isSearching}
                <div class="absolute right-6 top-1/2 -translate-y-1/2">
                    <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            {/if}
        </div>

        {#if searchQuery.length >= 2}
            <div class="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-20">
                
                {#if results.length > 0}
                    <ul class="divide-y divide-white/5">
                        {#each results as user (user.id)}
                            <li>
                                <a href={resolve(`/profile/${user.id}`)} class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div class="flex items-center gap-4">
                                        {#if user.image}
                                            <img 
                                                src={user.image} 
                                                alt="{user.username}'s avatar" 
                                                class="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-blue-500 transition-colors"
                                            />
                                        {:else}
                                            <div class="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                        {/if}

                                        <span class="text-white font-bold">{user.username}</span>
                                    </div>
                                    
                                    <div class="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg">
                                        {user.creatures} 🥚
                                    </div>
                                </a>
                            </li>
                        {/each}
                    </ul>
                {:else if !isSearching}
                    <div class="p-6 text-center text-gray-500 font-medium">
                        No users found matching "{searchQuery}"
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>