import type { App } from '$lib/types/types';
import { appInstances, components, gid, zstack } from '$lib/stores/stores';
import { get } from 'svelte/store';

export function addInstance(componentType: string, props: Record<string, any> = {}) {
	zstack.set([...get(zstack), get(zstack).length]);
	appInstances.set([
		...get(appInstances),
		{
			componentType: componentType as App,
			component: get(components)[componentType as App],
			visible: true,
			id: get(gid),
			props
		}
	]);
	gid.set(get(gid) + 1);
}

export function removeInstance(id: number) {
	appInstances.set(get(appInstances).filter((_, i) => i !== id));
	zstack.set(
		get(zstack)
			.filter((z) => z !== id)
			.map((z) => (z > id ? z - 1 : z))
	);
}

export function putOnTop(id: number) {
	zstack.set([...get(zstack).filter((z) => z !== id), id]);
}
