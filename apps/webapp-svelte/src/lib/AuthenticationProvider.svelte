<script lang="ts" context="module">
  export type AuthenticationContext = {
    data: Writable<Authentication>;
    join: () => void;
  };
</script>

<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { getGamePlayers, postLogin } from "./api.client";
  import appStore, { type Authentication } from "./app.store";
  import { writable, type Writable } from "svelte/store";

  const { data: app, cleanup, register } = appStore;

  let username = $app.authentication.username;

  let modalRef: HTMLDialogElement;

  const store = writable<Authentication>({
    authenticated: false,
    username: "",
  });

  const handleSignIn = async () => {
    await postLogin({ username });

    register({
      authentication: {
        authenticated: true,
        username,
      },
    });

    modalRef.close();
  };

  const handleJoin = () => {
    modalRef.showModal();
  };

  let awaited: Promise<unknown>;
  onMount(() => {
    app.subscribe(({ authentication }) => {
      store.set(authentication);
    });

    if ($app.authentication.authenticated) {
      awaited = getGamePlayers().then((players) => {
        if (
          players.length === 0 ||
          !players.some((player) => player.name === username)
        ) {
          cleanup();
        }
      });
    }
  });

  setContext<AuthenticationContext>("authentication", {
    data: store,
    join: handleJoin,
  });
</script>

{#await awaited}
  <p>Loading...</p>
{:then}
  <slot />
{:catch}
  <p>Something went wrong</p>
{/await}

<dialog bind:this={modalRef}>
  <h1>Welcome to movies!</h1>
  <p>Please enter your name:</p>
  <input type="text" bind:value={username} />
  <button on:click={handleSignIn}>Submit</button>
</dialog>
