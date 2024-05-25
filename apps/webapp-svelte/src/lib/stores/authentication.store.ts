import { writable, type Writable } from "svelte/store";
import { postLogin } from "../api.client";

export interface Authentication {
  authenticated: boolean;
  username: string;
}

const AUTHENTICATION_LOCAL_STORAGE_KEY = "movies";

const DEFAULT_AUTHENTICATION_STATE: Authentication = {
  authenticated: false,
  username: "",
};

const store = writable<Authentication>(DEFAULT_AUTHENTICATION_STATE);

const item = localStorage.getItem(AUTHENTICATION_LOCAL_STORAGE_KEY);

if (item) {
  store.set(JSON.parse(item));
}

const login = async (username: string) => {
  await postLogin({ username });
  store.set({ authenticated: true, username });
  localStorage.setItem(
    AUTHENTICATION_LOCAL_STORAGE_KEY,
    JSON.stringify({ authenticated: true, username })
  );
};

const logout = async () => {
  store.set(DEFAULT_AUTHENTICATION_STATE);
  localStorage.removeItem(AUTHENTICATION_LOCAL_STORAGE_KEY);
};

export { store, login, logout };
