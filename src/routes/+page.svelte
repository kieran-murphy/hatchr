<script lang="ts">
	let { data } = $props();
	import creatureImg from '$lib/assets/silhouette.png';

	const rarityColors = {
		COMMON: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
		UNCOMMON: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
		RARE: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
		LEGENDARY:
			'text-yellow-400 bg-yellow-400/10 border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
	};
</script>

<div class="mx-auto max-w-7xl p-6 md:p-12">
	<header class="mb-12 flex items-end justify-between">
		<div>
			<h1 class="text-4xl font-black tracking-tighter text-white uppercase">Your Collection</h1>
			<p class="font-medium text-gray-500">Total Creatures: {data.creatures.length}</p>
		</div>
		<a
			href="/hatch"
			class="rounded-lg bg-blue-600 px-6 py-2 font-bold text-white transition hover:bg-blue-700"
		>
			Hatch More
		</a>
	</header>

	{#if data.creatures.length === 0}
		<div
			class="rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.02] py-32 text-center"
		>
			<p class="mb-6 text-gray-500">Your collection is empty. Time to hatch some eggs!</p>
			<a href="/hatch" class="font-bold text-blue-500 underline-offset-4 hover:underline">Go →</a>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{#each data.creatures as creature (creature.id)}
				<div
					class="group relative rounded-2xl border border-white/10 bg-[#0A0A0A] p-4 transition-all hover:-translate-y-1 hover:border-white/20"
				>
					<div
						class="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-black"
					>
						<img
							src={creatureImg}
							alt={creature.speciesName}
							class="h-full w-full object-cover transition-transform group-hover:scale-110"
						/>
					</div>

					<div class="space-y-2">
						<span
							class="inline-block rounded border px-2 py-0.5 text-[10px] font-black uppercase {rarityColors[
								creature.rarity
							]}"
						>
							{creature.rarity}
						</span>
						<h3 class="text-lg leading-tight font-bold tracking-tight text-white">
							{creature.speciesName}
						</h3>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
