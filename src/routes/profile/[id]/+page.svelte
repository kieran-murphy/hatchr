<script lang="ts">
    import { User, Mail, Gem, ChevronRight, Star, LayoutGrid, Fingerprint, UserPlus, UserMinus, X } from '@lucide/svelte';
    import { fly, fade } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { resolve } from '$app/paths';
    
    let { data } = $props();

    let favorites = $derived(data.creatures?.filter(c => c.isFavorite) ?? []);

    let totalCount = $derived(data.creatures?.length ?? 0);
    let uniqueTypes = $derived(new Set(
        data.creatures?.map(c => 
            c.type2 ? [c.type1, c.type2].sort().join('-') : c.type1
        )
    ).size);

    let followerCount = $derived(data.profile?.followers?.length ?? 0);
    let followingCount = $derived(data.profile?.following?.length ?? 0);

    let isModalOpen = $state(false);
    let modalType = $state<'followers' | 'following' | null>(null);

    let activeModalList = $derived.by(() => {
        if (modalType === 'followers') {
            return data.profile?.followers?.map(f => f.follower) ?? [];
        }
        if (modalType === 'following') {
            return data.profile?.following?.map(f => f.following) ?? [];
        }
        return [];
    });

    const rarityBorders = {
        COMMON: 'border-white/5',
        RARE: 'border-blue-500/30',
        EPIC: 'border-purple-500/30',
        LEGENDARY: 'border-yellow-500/50 shadow-[0_0_20px_rgba(250,204,21,0.15)]'
    };

    function openModal(type: 'followers' | 'following') {
        modalType = type;
        isModalOpen = true;
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        isModalOpen = false;
        setTimeout(() => modalType = null, 300);
        document.body.style.overflow = '';
    }
</script>

<div class="max-w-3xl mx-auto py-16 px-6 relative">
    <div class="bg-[#0A0A0A]/60 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        
        <header class="mb-8 flex flex-col items-center text-center">
            <div class="w-24 h-24 bg-linear-to-br from-blue-600 to-purple-600 rounded-3xl mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20">
                {#if data.profile?.image}
                    <img 
                        src={data.profile.image} 
                        alt={data.profile.name} 
                        class="w-full h-full object-cover rounded-3xl" 
                    />
                {:else}
                    <User size={48} strokeWidth={2.5} class="text-white" />
                {/if}
            </div>
            <h1 class="text-5xl font-black tracking-tighter text-white uppercase italic">
                {data.profile.name}
            </h1>
            <p class="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2">
                Hatchr ID: {data.profile.id?.slice(0, 8) ?? 'RANKED TRAINER'}
            </p>
        </header>

        <div class="flex flex-col items-center gap-6 mb-12">
            <div class="flex gap-8 items-center justify-center">
                <button 
                    onclick={() => openModal('following')}
                    class="text-center hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all cursor-pointer"
                >
                    <p class="text-white text-xl font-black italic">{followingCount}</p>
                    <p class="text-gray-500 text-[9px] uppercase font-black tracking-widest">Following</p>
                </button>
                
                <div class="w-px h-8 bg-white/10"></div>
                
                <button 
                    onclick={() => openModal('followers')}
                    class="text-center hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all cursor-pointer"
                >
                    <p class="text-white text-xl font-black italic">{followerCount}</p>
                    <p class="text-gray-500 text-[9px] uppercase font-black tracking-widest">Followers</p>
                </button>
            </div>

            {#if !data.isOwnProfile}
                <form 
                    method="POST" 
                    action="?/toggleFollow" 
                    use:enhance
                >
                    <button 
                        class="flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all cursor-pointer
                        {data.isFollowing 
                            ? 'bg-white/5 border border-white/10 text-white hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500' 
                            : 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95'}"
                    >
                        {#if data.isFollowing}
                            <UserMinus size={16} strokeWidth={3} />
                            Unfollow
                        {:else}
                            <UserPlus size={16} strokeWidth={3} />
                            Follow Trainer
                        {/if}
                    </button>
                </form>
            {/if}
        </div>

        <section class="mb-12">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                    <Star size={14} class="text-yellow-400" fill="currentColor" />
                    Top 4 Showcase
                </h2>
            </div>

            {#if favorites.length === 0}
                <div class="group border-2 border-dashed border-white/5 bg-white/[0.02] rounded-[2rem] py-12 text-center">
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest">No featured creatures</p>
                </div>
            {:else}
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {#each favorites as fav (fav.id)}
                        <a href={resolve(`/creature/${fav.id}`)} class="block">
                        <div 
                            in:fly={{ y: 20, duration: 400 }}
                            class="group relative aspect-square bg-[#0D0D0D] border rounded-3xl p-4 transition-all {rarityBorders[fav.rarity] || 'border-white/5'}"
                        >
                            <img src={fav.imageUrl} alt="" class="w-full h-full object-contain" />
                            
                        </div>
                        </a>
                    {/each}
                </div>
            {/if}
        </section>

        <div class="space-y-4">
            {#if data.isOwnProfile}
                <div class="group relative bg-white/5 border border-white/10 rounded-3xl p-8 transition-all hover:border-blue-500/30 overflow-hidden">
                    <div class="flex justify-between items-end">
                        <div>
                            <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Gem size={12} class="text-blue-400" />
                                Your Vault Balance
                            </p>
                            <h2 class="text-6xl font-mono font-bold text-white tracking-tighter leading-none">
                                {data.profile.gems?.toLocaleString() ?? 0}
                            </h2>
                        </div>
                        <span class="text-4xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">💎</span>
                    </div>
                </div>

                <div class="p-6 bg-[#0D0D0D] border border-white/5 rounded-2xl flex flex-col gap-1">
                    <p class="text-gray-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <Mail size={12} />
                        Private Email
                    </p>
                    <p class="text-gray-200 font-bold truncate">{data.profile.email}</p>
                </div>
            {/if}

            <div class="grid grid-cols-2 gap-4">
                <div class="p-6 bg-[#0D0D0D] border border-white/5 rounded-2xl flex flex-col gap-1">
                    <p class="text-gray-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <LayoutGrid size={12} class="text-indigo-400" />
                        Total Creatures
                    </p>
                    <p class="text-2xl font-black text-white italic">{totalCount}</p>
                </div>

                <div class="p-6 bg-[#0D0D0D] border border-white/5 rounded-2xl flex flex-col gap-1">
                    <p class="text-gray-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <Fingerprint size={12} class="text-blue-400" />
                        Collected Types
                    </p>
                    <p class="text-2xl font-black text-white italic">{uniqueTypes}/105</p>
                </div>
            </div>

        </div>

        <footer class="mt-12 flex flex-col gap-3">
            {#if data.isOwnProfile}
                <a 
                    href={resolve('/')}
                    class="group flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-black uppercase text-sm rounded-2xl transition-all hover:scale-[1.02]"
                >
                    My Collection
                    <ChevronRight size={18} strokeWidth={3} />
                </a>
            {:else}
                <a 
                    href={resolve(`/profile/${data.profile.id}/collection`)} 
                    class="group flex items-center justify-center gap-2 w-full py-4 bg-[#2563EB] text-white font-black italic uppercase text-sm rounded-2xl transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                    See Collection
                    <ChevronRight size={18} strokeWidth={3} />
                </a>
            {/if}
        </footer>
    </div>
</div>

{#if isModalOpen}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        in:fade={{ duration: 200 }}
        out:fade={{ duration: 200 }}
    >
        <div class="absolute inset-0" onclick={closeModal} role="button" tabindex="0" onkeydown={(e) => e.key === 'Escape' && closeModal()}></div>
        
        <div 
            class="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            in:fly={{ y: 20, duration: 300, delay: 50 }}
            out:fly={{ y: 20, duration: 200 }}
        >
            <div class="flex items-center justify-between p-6 border-b border-white/5">
                <h3 class="text-lg font-black text-white uppercase italic tracking-wider">
                    {modalType === 'followers' ? 'Followers' : 'Following'}
                </h3>
                <button 
                    onclick={closeModal}
                    class="p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>
            </div>

            <div class="overflow-y-auto overscroll-contain flex-1 p-2">
                {#if activeModalList.length > 0}
                    <ul class="divide-y divide-white/5">
                        {#each activeModalList as user (user.id)}
                            <li>
                                <a 
                                    href={resolve(`/profile/${user.id}`)} 
                                    onclick={closeModal}
                                    class="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <div class="flex items-center gap-4">
                                        {#if user.image}
                                            <img 
                                                src={user.image} 
                                                alt="{user.name}'s avatar" 
                                                referrerpolicy="no-referrer"
                                                class="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:border-blue-500 transition-colors"
                                            />
                                        {:else}
                                            <div class="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-bold text-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                        {/if}

                                        <span class="text-white font-bold">{user.name}</span>
                                    </div>
                                    
                                    <div class="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                        {user.creaturesCount ?? user.creatures?.length ?? 0} 🥚
                                    </div>
                                </a>
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <div class="p-12 text-center">
                        <p class="text-gray-500 text-sm font-bold uppercase tracking-widest">
                            No users found
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}
