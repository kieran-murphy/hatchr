import type { Component } from 'svelte';
import {
    LayoutGrid,
    WandSparkles,
    Sparkles,
    Pyramid,
    Moon,
    Crown,
    Zap,
    Flame,
    Ghost,
    Leaf,
    Mountain,
    Snowflake,
    Anvil,
    Bubbles,
    Eye,
    Droplet
} from '@lucide/svelte';

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';

export const rarityWeight: Record<Rarity, number> = {
    COMMON: 1,
    UNCOMMON: 2,
    RARE: 3,
    LEGENDARY: 4
};

export const CREATURE_POOL: Record<Rarity, string[]> = {
    COMMON: ['Water', 'Grass', 'Fire', 'Poison', 'Ground'], 
    UNCOMMON: ['Electric', 'Ice', 'Dark', 'Steel'],
    RARE: ['Ghost', 'Psychic', 'Arcane'],
    LEGENDARY: ['Cosmic', 'Dragon', 'Crystal']
};

export const typeStyles: Record<string, { text: string, dot: string, icon: Component }> = {
    'All': { text: 'text-white', dot: 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]', icon: LayoutGrid },
    'Arcane': { text: 'text-pink-500', dot: 'bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.8)]', icon: WandSparkles },
    'Cosmic': { text: 'text-fuchsia-400', dot: 'bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.6)]', icon: Sparkles },
    'Crystal': { text: 'text-cyan-300', dot: 'bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.6)]', icon: Pyramid },
    'Dark': { text: 'text-indigo-400', dot: 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.6)]', icon: Moon },
    'Dragon': { text: 'text-orange-500', dot: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]', icon: Crown },
    'Electric': { text: 'text-yellow-300', dot: 'bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.6)]', icon: Zap },
    'Fire': { text: 'text-red-500', dot: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]', icon: Flame },
    'Ghost': { text: 'text-purple-400', dot: 'bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.6)]', icon: Ghost },
    'Grass': { text: 'text-green-400', dot: 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)]', icon: Leaf },
    'Ground': { text: 'text-amber-500', dot: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]', icon: Mountain },
    'Ice': { text: 'text-sky-300', dot: 'bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.6)]', icon: Snowflake },
    'Steel': { text: 'text-zinc-300', dot: 'bg-zinc-300 shadow-[0_0_10px_rgba(212,212,216,0.6)]', icon: Anvil },
    'Poison': { text: 'text-emerald-400', dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]', icon: Bubbles },
    'Psychic': { text: 'text-pink-400', dot: 'bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.6)]', icon: Eye },
    'Water': { text: 'text-blue-500', dot: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]', icon: Droplet }
};

export const TYPE_RARITY_MAP: Record<string, Rarity> = {};

for (const [rarity, types] of Object.entries(CREATURE_POOL)) {
    for (const type of types) {
        TYPE_RARITY_MAP[type] = rarity as Rarity;
    }
}

export function getRandomType(rarity: Rarity): string {
    const speciesList = CREATURE_POOL[rarity];
    return speciesList[Math.floor(Math.random() * speciesList.length)];
}