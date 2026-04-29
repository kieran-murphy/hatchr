export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';

const CREATURE_POOL: Record<Rarity, string[]> = {
    COMMON: ['Water', 'Grass', 'Fire', 'Normal', 'Bug', 'Rock', 'Steel', 'Poison'],
    UNCOMMON: ['Electric', 'Ground', 'Ice', 'Flying'],
    RARE: ['Fighting', 'Dark', 'Psychic', 'Ghost'],
    LEGENDARY: ['Fairy', 'Dragon']
};

export function getRandomRarity(): Rarity {
    const roll = Math.random() * 100; 

    if (roll < 3) return 'LEGENDARY';   // 1% chance
    if (roll < 10) return 'RARE';        // 5% chance
    if (roll < 25) return 'UNCOMMON';   // 15% chance
    return 'COMMON';                    // 79% chance
}

export function getRandomType(rarity: Rarity): string {
    const speciesList = CREATURE_POOL[rarity];
    return speciesList[Math.floor(Math.random() * speciesList.length)];
}