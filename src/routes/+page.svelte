<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<section class="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
	<div
		class="rounded-4xl border border-border bg-card p-10 shadow-sm md:p-14"
		style="background: linear-gradient(135deg, var(--hero-start), var(--hero-mid), var(--hero-end));"
	>
		<p class="text-sm font-medium tracking-wide text-primary-foreground/80 uppercase">FamilyOS</p>
		<h1
			class="mt-3 max-w-2xl text-4xl font-medium tracking-tighter text-primary-foreground md:text-6xl"
		>
			Your household second brain
		</h1>
		<p class="mt-4 max-w-xl text-primary-foreground/80">
			Centralize family documents, bills, and tasks in one secure platform — with minimal manual
			entry.
		</p>
		<div class="mt-8 flex flex-wrap gap-3">
			<Button href={resolve('/auth/login')} class="rounded-full" size="lg">Sign in</Button>
			<Button href={resolve('/auth/signup')} variant="outline" class="rounded-full" size="lg">
				Create account
			</Button>
			<Button
				variant="ghost"
				class="rounded-full text-primary-foreground"
				onclick={() => goto(resolve('/dashboard'))}
			>
				Go to dashboard
			</Button>
		</div>
	</div>
</section>
