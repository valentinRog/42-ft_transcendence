export type App = 'Pong' | 'ChatWindow' | 'Contact' | 'Profile';

export interface AppInstance {
	readonly componentType: App;
	readonly component: any;
	visible: boolean;
	readonly id: number;
}
