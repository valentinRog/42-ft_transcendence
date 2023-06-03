export type Tree = {
	name: string;
} & ({ event: () => void } | { children: Tree[] });
