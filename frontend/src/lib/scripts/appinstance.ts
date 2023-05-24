import type { App, AppInstance } from '$lib/types/types';
import { appInstances, components, gid, zstack } from '$lib/stores/stores';

export function addInstance(componentType: string, props : Record<string, any> = {}) {
	let instances: AppInstance[] = [];
	appInstances.subscribe((val) => {
		instances = val;
	});
	let comps: Record<string, any> = {};
	components.subscribe((val) => {
		comps = val;
	});
	let zs = new Array<number>();
	zstack.subscribe((val) => (zs = val));
	let id = 0;
	gid.subscribe((val) => (id = val));
	zs = [...zs, zs.length];
	instances = [
		...instances,
		{
			componentType: componentType as App,
			component: comps[componentType as App],
			visible: true,
			id: id++,
			props
		}
	];
	appInstances.set(instances);
	zstack.set(zs);
	gid.set(id); 
}

export function removeInstance(id: number) {
	let zs = new Array<number>();
	zstack.subscribe((val) => (zs = val));
	let instances: AppInstance[] = [];
	appInstances.subscribe((val) => {
		instances = val;
	});
	instances = instances.filter((_, i) => i !== id);
	zs = zs.filter((z) => z !== id).map((z) => (z > id ? z - 1 : z));
	zstack.set(zs);
	appInstances.set(instances);
}

export function putOnTop(id: number) {
	let zs = new Array<number>();
	zstack.subscribe((val) => (zs = val));
	zs = [...zs.filter((z) => z !== id), id];
	zstack.set(zs);
}
