<script lang="ts">
    import { resolve } from '$app/paths';

    let { data } = $props();

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
            Top Trainers by Creature Count
        </p>
    </header>

    <div class="bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        {#if data.leaderboard && data.leaderboard.length > 0}
            <ul class="p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
                {#each data.leaderboard as user, index (user.id)}
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
                            
                            <div class="text-emerald-400 font-black tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-1 sm:gap-2 shrink-0">
                                <span class="text-sm sm:text-base">{user.uniqueCount}</span>
                                <span class="text-emerald-600/50 text-xs sm:text-sm hidden min-[380px]:inline">/ 105</span> 
                                <span class="text-base sm:text-lg grayscale group-hover:grayscale-0 transition-all">🥚</span>
                            </div>
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