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

export const typeStyles: Record<string, { text: string, dot: string }> = {
    'All': { text: 'text-white', dot: 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]' },
    'Arcane': { text: 'text-pink-500', dot: 'bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.8)]' },
    'Cosmic': { text: 'text-fuchsia-400', dot: 'bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.6)]' },
    'Crystal': { text: 'text-cyan-300', dot: 'bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.6)]' },
    'Dark': { text: 'text-indigo-400', dot: 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.6)]' },
    'Dragon': { text: 'text-orange-500', dot: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]' },
    'Electric': { text: 'text-yellow-300', dot: 'bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.6)]' },
    'Fire': { text: 'text-red-500', dot: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' },
    'Ghost': { text: 'text-purple-400', dot: 'bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.6)]' },
    'Grass': { text: 'text-green-400', dot: 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)]' },
    'Ground': { text: 'text-amber-500', dot: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]' },
    'Ice': { text: 'text-sky-300', dot: 'bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.6)]' },
    'Steel': { text: 'text-zinc-300', dot: 'bg-zinc-300 shadow-[0_0_10px_rgba(212,212,216,0.6)]' },
    'Poison': { text: 'text-emerald-400', dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' },
    'Psychic': { text: 'text-pink-400', dot: 'bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.6)]' },
    'Water': { text: 'text-blue-500', dot: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]' }
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