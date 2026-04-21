<script lang="ts">
    let { data } = $props();
</script>

<div class="max-w-2xl mx-auto py-16 px-6">
    <div class="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
        <header class="mb-8 border-b border-white/5 pb-6">
            <h1 class="text-3xl font-black tracking-tighter text-white uppercase italic">
                Trainer Profile
            </h1>
            <p class="text-gray-500 font-medium">{data.profile.name}</p>
        </header>

        <div class="space-y-6">
            <div class="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 flex justify-between items-center">
                <div>
                    <p class="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">Available Currency</p>
                    <h2 class="text-4xl font-mono font-bold text-white">
                        {data.profile.gems.toLocaleString()}
                    </h2>
                </div>
                <div class="text-4xl opacity-80">💎</div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p class="text-gray-500 text-[10px] uppercase font-bold">Account Email</p>
                    <p class="text-gray-300 text-sm truncate">{data.profile.email}</p>
                </div>
                <div class="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p class="text-gray-500 text-[10px] uppercase font-bold">Status</p>
                    <p class="text-green-400 text-sm font-bold">Active Trainer</p>
                </div>
            </div>
        </div>

        <footer class="mt-8 pt-6">
            <a href="/collection" class="block w-full py-3 bg-white text-black text-center font-bold rounded-xl hover:bg-gray-200 transition">
                Go to Collection
            </a>
        </footer>
    </div>
</div>