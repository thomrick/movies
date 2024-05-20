<script lang="ts" context="module">
  import type { Writable } from "svelte/store";
  
  type Authentication = {
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
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

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

  const handleRegister = (context: Partial<LocalStorageData>) => {
    store.update((prev) => {
      const cloned = { ...prev, ...context };
      localStorage.setItem("movies", JSON.stringify(cloned));
      return cloned;
    });
  };

  const handleCleanup = () => {
    store.set(DEFAULT_DATA);
    localStorage.removeItem("movies");
  };

  setContext<LocalStorageContext>("local-storage", {
    data: store,
    register: handleRegister,
    cleanup: handleCleanup,
  });
</script>

<slot />
