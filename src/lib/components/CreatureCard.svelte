<script lang="ts">
    import { resolve } from '$app/paths';
    import { typeStyles, type Rarity } from '$lib/game.js';
    import { Star } from '@lucide/svelte';

    let {
        creature
    }: {
        creature: {
            id: string;
            speciesName: string;
            imageUrl: string;
            rarity: Rarity;
            type1: string;
            type2: string | null;
            isFavorite: boolean | null;
        };
    } = $props();

    const rarityStyles: Record<Rarity, { dot: string; text: string; glow?: string }> = {
        COMMON: { dot: 'bg-gray-400', text: 'text-gray-400' },
        UNCOMMON: { dot: 'bg-blue-400', text: 'text-blue-400' },
        RARE: { dot: 'bg-purple-400', text: 'text-purple-400' },
        LEGENDARY: {
            dot: 'bg-yellow-400',
            text: 'text-yellow-400',
            glow: 'shadow-[0_0_15px_rgba(250,204,21,0.2)]'
        }
    };
</script>

<a
    href={resolve(`/creature/${creature.id}`)}
    class="group relative block rounded-2xl border border-white/5 bg-[#0A0A0A]/60 p-4 backdrop-blur-md transition-all hover:-translate-y-2 hover:border-white/20 hover:bg-[#0D0D0D] {rarityStyles[
        creature.rarity
    ]?.glow ?? ''}"
>
    <div class="relative">
        <div class="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-black/40">
            <img
                src={creature.imageUrl}
                alt={creature.speciesName}
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {#if creature.isFavorite}
                <div class="absolute top-2 right-2 bg-black/50 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                    <Star size={20} class="fill-yellow-400 text-yellow-400" />
                </div>
            {/if}
        </div>

        <div class="absolute -bottom-3 left-2 flex items-center gap-1.5">
            {#if creature.type1 && typeStyles[creature.type1]}
                {@const Icon1 = typeStyles[creature.type1].icon}
                <span
                    class="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/70 backdrop-blur {typeStyles[creature.type1].text}"
                    title={creature.type1}
                    aria-label="{creature.type1} type"
                >
                    <Icon1 size={13} />
                </span>
            {/if}

            {#if creature.type2 && typeStyles[creature.type2]}
                {@const Icon2 = typeStyles[creature.type2].icon}
                <span
                    class="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/70 backdrop-blur {typeStyles[creature.type2].text}"
                    title={creature.type2}
                    aria-label="{creature.type2} type"
                >
                    <Icon2 size={13} />
                </span>
            {/if}
        </div>
    </div>

    <div class="mt-5 px-0.5">
        <h3 class="truncate text-lg font-black italic tracking-tighter text-white uppercase transition-colors group-hover:text-blue-400">
            {creature.speciesName}
        </h3>

        <div class="mt-1.5 flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full {rarityStyles[creature.rarity].dot}"></span>
            <span class="text-[9px] font-black uppercase tracking-wider {rarityStyles[creature.rarity].text}">
                {creature.rarity}
            </span>
        </div>
    </div>
</a>
