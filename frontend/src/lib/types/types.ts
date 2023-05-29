export type App = 'Pong' | 'ChatWindow' | 'Contact' | 'Profile' | 'Conversation';

export interface AppInstance {
	readonly componentType: App;
	readonly component: any;
	visible: boolean;
	readonly id: number;
	readonly propsWin: Record<string, any>;
	readonly props: Record<string, any>;
}
