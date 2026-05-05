<script lang="ts">
    import { page } from '$app/stores';
    import { ChevronRight, Drill, ZapOff, Compass } from 'lucide-svelte/icons';
    import { fade, fly } from 'svelte/transition';
</script>

<div class="max-w-3xl mx-auto min-h-screen flex items-center justify-center py-16 px-6 relative">
    <div 
        in:fade={{ duration: 400 }}
        class="w-full bg-[#0A0A0A]/60 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center"
    >
        
        <header class="mb-12 flex flex-col items-center">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ZapOff size={48} strokeWidth={2.5} class="text-white" />
            </div>
            
            <h1 class="text-6xl font-black tracking-tighter text-white uppercase italic">
                Error {$page.status}
            </h1>
            <p class="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2">
                System Status: Connection Severed
            </p>
        </header>

        <div class="p-6 bg-[#0D0D0D] border border-white/5 rounded-2xl flex flex-col gap-1 mb-8">
            <p class="text-gray-500 text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2">
                <Drill size={12} class="text-purple-400" />
                Error Message
            </p>
            <p class="text-gray-200 font-bold italic uppercase tracking-tight">
                "{$page.error?.message || 'Lost in the void'}"
            </p>
        </div>

        <footer class="flex flex-col gap-3">
            <a href="/" class="group flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-black uppercase text-sm rounded-2xl transition-all hover:scale-[1.02]">
                Return to Safety
                <ChevronRight size={18} strokeWidth={3} />
            </a>
        </footer>
    </div>
</div>

<style>
    :global(body) {
        background-color: #050505;
    }

    .animate-spin-slow {
        animation: spin 4s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
</style>