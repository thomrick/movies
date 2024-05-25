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
  import Button from "./components/Button.svelte";

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

<dialog class="modal" bind:this={modalRef}>
  <div class="modal-header">
    <h1>Welcome to movies!</h1>
  </div>
  <div class="modal-content">
    <p class="paragraph">Please enter your name:</p>
    <input class="text-field" type="text" bind:value={username} />
  </div>
  <div class="modal-footer">
    <Button variant="ghost" on:click={handleSignIn}>Submit</Button>
  </div>
</dialog>

<style>
  .modal[open] {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    background-color: var(--color-dark-a);
    color: var(--color-dark-c);
    border-radius: 8px;
    overflow: hidden;
    padding: 24px;
  }

  .modal[open]::backdrop {
    background-color: var(--color-dark-a);
    opacity: 0.5;
  }

  .modal-header {
    width: 100%;
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    position: relative;
  }

  .modal-footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .paragraph {
    margin-bottom: 24px;
  }

  .text-field {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    height: 48px;
    padding-inline: 16px;
    background-color: var(--color-dark-a);
    border-radius: 4px;
    color: var(--color-dark-c);
    cursor: text;
    border: 1px solid var(--color-dark-c);
  }
  .text-field:disabled {
    opacity: 0.6;
    cursor: default;
  }
</style>
