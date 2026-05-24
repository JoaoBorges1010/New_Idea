<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<section class="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12">
	<div class="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-wide text-indigo-600">FamilyOS</p>
		<h1 class="mt-2 text-3xl font-semibold text-slate-900">Your household second brain</h1>
		<p class="mt-3 text-slate-600">
			Centralize family documents, bills, and tasks in one secure platform.
		</p>
		<div class="mt-8 flex gap-3">
			<a
				href="/auth/login"
				class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
			>
				Sign in
			</a>
			<a
				href="/auth/signup"
				class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
			>
				Create account
			</a>
			<button
				type="button"
				class="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
				onclick={() => goto('/dashboard')}
			>
				Go to dashboard
			</button>
		</div>
	</div>
</section>
