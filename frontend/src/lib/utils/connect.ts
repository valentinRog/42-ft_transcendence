import { token, socket, user, contacts, chats, friendRequest } from '$lib/stores/stores';
import ioClient from 'socket.io-client';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { PUBLIC_BACKEND_URL } from '$env/static/public';

export function getUser() {
	fetch(`${PUBLIC_BACKEND_URL}/users/me`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${get(token)}`
		}
	})
		.then((res) => res.json())
		.then((data) => {
			user.set({
				id: data.id,
				username: data.username,
				login: data.login
			});
		});
}

export async function getFriends() {
	const res = await fetch(`${PUBLIC_BACKEND_URL}/users/me/friends`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${get(token)}`
		}
	});
	const data = await res.json();
	contacts.set(data);
	return data;
}

export async function getFriendRequest() {
	const res = await fetch(`${PUBLIC_BACKEND_URL}/notification/get?type=friend`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${get(token)}`
		}
	});
	const data = await res.json();
	friendRequest.set(data);
	return data;
}


export async function getAllUserChats() {
	const response = await fetch(`${PUBLIC_BACKEND_URL}/chat/allUserChats`, {
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
	const s = ioClient(PUBLIC_BACKEND_URL, {
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

export async function enable2fa() {
	const res = await fetch(`${PUBLIC_BACKEND_URL}/2fa/enable`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${get(token)}`
		}
	});
	const data = await res.json();
	console.log(data);
	return data;
}
