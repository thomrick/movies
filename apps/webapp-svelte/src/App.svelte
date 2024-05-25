<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { getGameCurrentMovie, postGameAnswer } from "./lib/api.client";
  import Button from "./lib/components/Button.svelte";
  import {
    store as authentication,
    login,
    logout,
  } from "./lib/stores/authentication.store";
  import { store as game, start, stop } from "./lib/stores/game.store";

  let videoRef: HTMLVideoElement | undefined = undefined;
  let modalRef: HTMLDialogElement;
  
  let switcher = false;
  
  let userInput = "";
  let username = "";

  onMount(() => {
    authentication.subscribe(async ({ authenticated, username }) => {
      let unsubscribe: () => void = () => {};

      if (authenticated) {
        await start();
        unsubscribe = game.subscribe(({ scoreboard }) => {
          if (
            scoreboard.length === 0 ||
            !scoreboard.some((p) => p.name === username)
          ) {
            logout();
            switcher = false;
          }
        });
      } else {
        stop();
        unsubscribe();
      }
    });
  });

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const result = await postGameAnswer({ title: userInput });
    userInput = "";
  };

  const handleSwithOn = () => {
    switcher = true;
    videoRef?.play();
  };

  const handleSwitchOff = () => {
    switcher = false;
    videoRef?.pause();
  };

  const handleSignIn = async () => {
    await login(username);
    modalRef.close();
    username = "";
  };

  const handleJoin = () => {
    modalRef.showModal();
  };
</script>

<header class="top-bar">
  <h1>Movies</h1>
</header>
<main class="page">
  <div class="panel">
    <div class="panel-content">
      <div class="tv">
        <div class="tv-screen">
          {#if !$authentication.authenticated}
            <img
              in:fade={{ duration: 1000 }}
              src="/mire-tdf.jpg"
              alt="Mire TDF"
            />
          {:else if !switcher}
            <div class="noise-effect switch-off" />
          {:else if $game.game?.phase === "PAUSE_PHASE"}
            <img
              class="tv-video"
              class:on={$game.game?.phase === "PAUSE_PHASE"}
              in:fly={{ y: 200, delay: 500, duration: 2000 }}
              src={$game.previousMovie?.posterUrl}
              alt={$game.previousMovie?.title}
            />
          {:else if $game.game?.phase === "MOVIE_PHASE"}
            <!-- svelte-ignore a11y-media-has-caption -->
            <video
              bind:this={videoRef}
              class="tv-video"
              in:fade={{ duration: 1000 }}
              src={getGameCurrentMovie()}
              on:loadeddata={() => videoRef?.play()}
            />
          {/if}
        </div>
        <div class="tv-controls">
          <button on:click={handleSwithOn}>On</button>
          <button on:click={handleSwitchOff}>Off</button>
        </div>
      </div>
    </div>
    <div class="panel-content no-space-bottom">
      <form class="form" on:submit={handleSubmit}>
        <div class="field">
          <input
            bind:value={userInput}
            disabled={!$authentication.authenticated ||
              $game.game?.phase !== "MOVIE_PHASE"}
            class="text-field"
            type="text"
          />
          <Button
            disabled={!$authentication.authenticated ||
              $game.game?.phase !== "MOVIE_PHASE"}
            type="submit"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  </div>
  <div class="panel">
    <div class="panel-content no-space-bottom">
      {#if !$authentication.authenticated}
        <Button on:click={handleJoin}>Join</Button>
      {:else}
        <table class="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {#each $game.scoreboard as player}
              <tr>
                <td>{player.name}</td>
                <td>{player.score}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</main>

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
  .top-bar {
    width: 100%;
    height: 74px;
    background-color: var(--color-dark-c);
    color: var(--color-dark-a);
    margin-bottom: 24px;
    padding-inline: 24px;
    display: flex;
    align-items: center;
  }

  .page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 1024px;
    margin-inline: auto;
  }

  .panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--color-dark-b);
    color: var(--color-dark-a);
    padding: 24px;
    margin-bottom: 24px;
    border-radius: 8px;
    box-shadow: 3px 3px 10px -3px rgba(245, 216, 131, 0.3);
    opacity: 0.9;
  }

  .panel-content {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
  }
  .panel-content.no-space-bottom {
    margin-bottom: 0;
  }

  .tv {
    width: 100%;
    background-color: #a52a2a;
    padding: 24px;
    border-radius: 50px;
    display: flex;
    gap: 24px;

    background-color: #a52a2a;
    background-image: url("/wood-pattern.png");
  }

  .tv-controls {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 100%;
    max-width: 150px;
    background-color: var(--color-dark-a);
    border-radius: 25px;
    padding: 12px;
    border: 10px solid gray;
  }

  .tv-screen {
    flex: 1;
    width: 100%;
    max-width: 800px;
    aspect-ratio: 4 / 3;
    position: relative;

    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-dark-a);
    border: 10px solid var(--color-dark-a);
    border-radius: 150px;
    overflow: hidden;
  }

  .tv-screen .noise-effect.switch-off {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    background:
      repeating-radial-gradient(#000 0 0.0001%, #fff 0 0.0002%) 50% 0/2500px
        2500px,
      repeating-conic-gradient(#000 0 0.0001%, #fff 0 0.0002%) 60% 60%/2500px
        2500px;
    background-blend-mode: difference;
    animation: b 0.2s infinite alternate;
  }

  @keyframes b {
    100% {
      background-position:
        50% 0,
        60% 50%;
    }
  }

  .tv-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .form {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .field {
    width: 100%;
    display: flex;
    gap: 24px;
  }

  .text-field {
    all: unset;
    width: 100%;
    height: 48px;
    padding-inline: 16px;
    background-color: var(--color-dark-a);
    border-radius: 4px;
    color: var(--color-dark-c);
    cursor: text;
  }
  .text-field:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .table {
    all: unset;
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid var(--color-dark-d);
    border-radius: 8px;
    overflow: hidden;
  }

  .table thead {
    all: unset;
    width: 100%;
    height: 48px;
    display: flex;
  }

  .table tr {
    all: unset;
    width: 100%;
    display: flex;
    align-items: center;
    height: 48px;
  }

  .table > :not(:last-child) {
    border-bottom: 1px solid var(--color-dark-d);
  }

  .table th {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-inline: 24px;
    background-color: var(--color-dark-d);
  }

  .table tbody > :not(:last-child) {
    border-bottom: 1px solid var(--color-dark-d);
  }

  .table td {
    width: 100%;
    display: flex;
    align-items: center;
    padding-inline: 24px;
  }

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
