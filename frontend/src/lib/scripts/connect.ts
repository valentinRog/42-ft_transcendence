import { token, socket, user, contacts, chats } from '$lib/stores/stores';
import ioClient from 'socket.io-client';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';

export function getUser() {
	fetch('http://localhost:3000/users/me', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${get(token)}`
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			user.set({
				id: data.id,
				username: data.username,
				login: data.login
			});
		});
}

export async function getFriends() {
	const res = await fetch('http://localhost:3000/users/me/friends', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${get(token)}`
		}
	});
	const data = await res.json();
	contacts.set(data);
	return data;
}

export async function getAllUserChats() {
	const response = await fetch('http://localhost:3000/chat/allUserChats', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${get(token)}`,
			'Content-Type': 'application/json'
		}
	});
	if (response.ok) {
		const allUserChats = await response.json();
		chats.set(allUserChats);
	} else console.error(`Error fetching all messages: ${response.statusText}`);
}

export function connectSocket() {
	let url = window.location.origin;
	url = url.substring(0, url.lastIndexOf(':'));
	const s = ioClient('localhost' + ':3000', {
		query: {
			token: get(token)
		}
	});
	socket.set(s);
}

export function logout() {
	sessionStorage.removeItem('token');
	token.set(null);
	get(socket)?.close();
	goto('/login');
}
