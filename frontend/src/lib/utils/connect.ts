import { token} from '$lib/stores';
import { goto } from '$app/navigation';

export function logout() {
	sessionStorage.removeItem('token');
	token.set(null);
	goto('/login');
}
