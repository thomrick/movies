import { writable, type Writable } from "svelte/store";

export type Authentication = {
  authenticated: boolean;
  username: string;
};

export type LocalStorageData = {
  authentication: Authentication;
};

export type LocalStorageContext = {
  data: Writable<LocalStorageData>;
  register: (context: Partial<LocalStorageData>) => void;
  cleanup: () => void;
};

const DEFAULT_DATA: LocalStorageData = {
  authentication: {
    authenticated: false,
    username: "",
  },
};

const item = localStorage.getItem("movies");

const store = writable<LocalStorageData>(
  item ? JSON.parse(item) : DEFAULT_DATA
);

const handleCleanup = () => {
  localStorage.removeItem("movies");
  store.set(DEFAULT_DATA);
}

const handleRegister = (context: Partial<LocalStorageData>) => {
  store.update((prev) => {
    const cloned = { ...prev, ...context };
    localStorage.setItem("movies", JSON.stringify(cloned));
    return cloned;
  });
};

const context: LocalStorageContext = {
  data: store,
  cleanup: handleCleanup,
  register: handleRegister,
}

export default context;
