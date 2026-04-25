<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';

    let { form }: { form: ActionData } = $props();
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh] px-6">
    <div class="w-full max-w-md bg-[#0A0A0A]/60 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl text-center">
        
        <header class="mb-10">
            <h1 class="text-5xl font-black text-white tracking-tighter italic mb-3">
                WELCOME<span class="text-blue-500">.</span>
            </h1>
        </header>

        <div class="space-y-4">
            <form method="post" action="?/signInSocial" use:enhance>
                <input type="hidden" name="provider" value="github" />
                <input type="hidden" name="callbackURL" value="/" /> <button class="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-95 overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-4.51-2-7-2"/></svg>
                    CONTINUE WITH GITHUB
                </button>
            </form>

            </div>

        {#if form?.message}
            <div class="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p class="text-red-400 text-xs font-bold uppercase tracking-wider">{form.message}</p>
            </div>
        {/if}

        <footer class="mt-10">
            <p class="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                By entering, you agree to the Hatchr Protocols
            </p>
        </footer>
    </div>
</div>