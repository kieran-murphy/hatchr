export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';

export const rarityWeight: Record<Rarity, number> = {
    COMMON: 1,
    UNCOMMON: 2,
    RARE: 3,
    LEGENDARY: 4
};

export const CREATURE_POOL: Record<Rarity, string[]> = {
    COMMON: ['Water', 'Grass', 'Fire', 'Poison', 'Ground'], 
    UNCOMMON: ['Electric', 'Ice', 'Dark'],
    RARE: ['Ghost', 'Psychic'],
    LEGENDARY: ['Cosmic', 'Dragon', 'Crystal']
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