import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import {
	createConvexAuthHooks,
	createRouteMatcher
} from '@mmailaender/convex-auth-svelte/sveltekit/server';

const isPublicRoute = createRouteMatcher(['/', '/auth{/*rest}']);

const { handleAuth, isAuthenticated } = createConvexAuthHooks();

const requireAuth: Handle = async ({ event, resolve }) => {
	if (isPublicRoute(event.url.pathname)) {
		return resolve(event);
	}

	if (!(await isAuthenticated(event))) {
		const redirectTo = encodeURIComponent(event.url.pathname + event.url.search);
		throw redirect(302, `/auth/login?redirectTo=${redirectTo}`);
	}

	return resolve(event);
};

export const handle = sequence(handleAuth, requireAuth);
