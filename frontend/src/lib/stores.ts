import { writable } from 'svelte/store';
import type { Socket } from 'socket.io-client';

export const token = writable<string | null>(null);
export const socket = writable<Socket | null>(null);
export const user = writable<{ id: number; username: string; login: string } | null>(null);
