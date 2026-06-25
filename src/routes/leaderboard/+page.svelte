<script lang="ts">
    import { resolve } from '$app/paths';

    let { data } = $props();

    let sortBy = $state('unique');

    let sortedLeaderboard = $derived.by(() => {
        let list = [...(data.leaderboard || [])];
        
        if (sortBy === 'gems') {
            return list.sort((a, b) => (b.gems || 0) - (a.gems || 0));
        }
        if (sortBy === 'total') {
            return list.sort((a, b) => (b.totalCount || 0) - (a.totalCount || 0));
        }
        
        // Default unique sort
        return list.sort((a, b) => (b.uniqueCount || 0) - (a.uniqueCount || 0));
    });

    function getRankStyles(index: number) {
        switch(index) {
            case 0: return 'border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.2)] bg-yellow-400/5';
            case 1: return 'border-slate-300/50 shadow-[0_0_20px_rgba(203,213,225,0.2)] bg-slate-300/5';
            case 2: return 'border-amber-600/50 shadow-[0_0_20px_rgba(217,119,6,0.2)] bg-amber-600/5';
            default: return 'border-white/5 bg-white/5 hover:border-white/20';
        }
    }

    function getRankText(index: number) {
        switch(index) {
            case 0: return 'text-yellow-400 border-yellow-400';
            case 1: return 'text-slate-300 border-slate-300';
            case 2: return 'text-amber-600 border-amber-600';
            default: return 'text-gray-500 border-white/10';
        }
    }
</script>

<div class="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
    <header class="mb-8 sm:mb-12 text-center">
        <h1 class="text-4xl sm:text-5xl font-black tracking-tighter text-white uppercase italic">
            Global Leaderboard
        </h1>
        <p class="font-bold text-blue-500 uppercase text-xs sm:text-sm tracking-widest mt-2">
            {#if sortBy === 'gems'}
                Top Trainers by Gems
            {:else if sortBy === 'total'}
                Top Trainers by Total Creatures
            {:else}
                Top Trainers by Unique Types
            {/if}
        </p>
    </header>

    <div class="flex items-center justify-center gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl w-fit mx-auto mb-8 overflow-x-auto whitespace-nowrap">
        {#each [
            { id: 'unique', label: 'Unique Types' }, 
            { id: 'total', label: 'Total Creatures' }, 
            { id: 'gems', label: 'Gems' }
        ] as option (option.id)}
            <button 
                onclick={() => sortBy = option.id}
                class="px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shrink-0 {sortBy === option.id ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'}"
            >
                {option.label}
            </button>
        {/each}
    </div>

    <div class="bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        {#if sortedLeaderboard.length > 0}
            <ul class="p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
                {#each sortedLeaderboard as user, index (user.id)}
                    <li>
                        <a 
                            href={resolve(`/profile/${user.id}`)} 
                            class="flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all hover:-translate-y-1 group {getRankStyles(index)}"
                        >
                            <div class="flex items-center gap-3 sm:gap-6 overflow-hidden">
                                <div class="w-6 sm:w-8 text-center font-black text-xl sm:text-2xl italic {getRankText(index).split(' ')[0]} shrink-0">
                                    #{index + 1}
                                </div>

                                <div class="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                    {#if user.image}
                                        <img 
                                            src={user.image} 
                                            alt="{user.username}'s avatar" 
                                            referrerpolicy="no-referrer"
                                            class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 {getRankText(index).split(' ')[1]} transition-colors shrink-0"
                                        />
                                    {:else}
                                        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center font-black text-lg sm:text-xl border-2 {index < 3 ? getRankText(index).split(' ')[1] : 'border-blue-500/30'} shrink-0">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    {/if}

                                    <span class="text-white font-black uppercase tracking-wider text-sm sm:text-lg group-hover:text-blue-400 transition-colors truncate max-w-[100px] sm:max-w-none">
                                        {user.username}
                                    </span>
                                </div>
                            </div>
                            
                            {#if sortBy === 'gems'}
                                <div class="text-blue-400 font-black tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-1 sm:gap-2 shrink-0">
                                    <span class="text-sm sm:text-base">{user.gems || 0}</span>
                                    <span class="text-base sm:text-lg grayscale group-hover:grayscale-0 transition-all">💎</span>
                                </div>
                            {:else if sortBy === 'total'}
                                <div class="text-amber-400 font-black tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-1 sm:gap-2 shrink-0">
                                    <span class="text-sm sm:text-base">{user.totalCount || 0}</span>
                                    <span class="text-base sm:text-lg grayscale group-hover:grayscale-0 transition-all">🥚</span>
                                </div>
                            {:else}
                                <div class="text-emerald-400 font-black tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-1 sm:gap-2 shrink-0">
                                    <span class="text-sm sm:text-base">{user.uniqueCount || 0}</span>
                                    <span class="text-emerald-600/50 text-xs sm:text-sm hidden min-[380px]:inline">/ 105</span> 
                                    <span class="text-base sm:text-lg grayscale group-hover:grayscale-0 transition-all">✨</span>
                                </div>
                            {/if}
                        </a>
                    </li>
                {/each}
            </ul>
        {:else}
            <div class="p-12 text-center text-gray-500 font-bold uppercase tracking-widest">
                No trainers found in the database.
            </div>
        {/if}
    </div>
</div>