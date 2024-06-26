<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { getGameCurrentMovie } from "./lib/api.client";
  import { authentication, login, logout } from "./lib/authentication.store";
  import {
    game,
    guess,
    players,
    previousMovie,
    start,
    stop,
  } from "./lib/game.store";

  let userInputRef: HTMLInputElement;
  let modalRef: HTMLDialogElement;
  let videoRef: HTMLVideoElement | undefined = undefined;

  let switcher = false;

  let userInput = "";
  let username = "";

  onMount(() => {
    authentication.subscribe(async ({ authenticated, username }) => {
      let unsubscribe: () => void = () => {};

      if (authenticated) {
        await start();
        unsubscribe = players.subscribe((registeredPlayers) => {
          if (
            registeredPlayers.length === 0 ||
            !registeredPlayers.some((p) => p.name === username)
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

    game.subscribe((value) => {
      if (switcher && value?.phase === "MOVIE_PHASE") {
        userInputRef?.focus();
      }

      if (value?.phase === "PAUSE_PHASE") {
        userInput = "";
      }
    });
  });

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    console.log("TRT", await guess(userInput));
    userInput = "";
  };

  const handleSwithOn = () => {
    switcher = true;
    userInputRef?.focus();
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
          {#if !$authentication.authenticated || $game?.phase === "END_PHASE"}
            <img
              in:fade={{ duration: 1000 }}
              src="/mire-tdf.jpg"
              alt="Mire TDF"
            />
          {:else if !switcher}
            <div class="noise-effect switch-off" />
          {:else if $game?.phase === "PAUSE_PHASE"}
            <img
              class="tv-video"
              class:on={$game?.phase === "PAUSE_PHASE"}
              in:fly={{ y: 200, delay: 500, duration: 2000 }}
              src={$previousMovie?.posterUrl}
              alt={$previousMovie?.title}
            />
          {:else if $game?.phase === "MOVIE_PHASE"}
            <!-- svelte-ignore a11y-media-has-caption -->
            <video
              bind:this={videoRef}
              class="tv-video"
              in:fade={{ duration: 1000 }}
              src={`${getGameCurrentMovie()}?${$game?.phaseNumber}`}
              on:loadeddata={() => videoRef?.play()}
            />
          {/if}
        </div>
        <div class="tv-controls">
          <div class="tv-channel">
            {`${$game?.phaseNumber ? $game.phaseNumber + 1 : 0}`}
            {$game?.totalPhase ? `/ ${$game.totalPhase}` : ""}
          </div>
          <div class="tv-switchers">
            <button
              class="tv-switch on"
              class:switched={switcher}
              disabled={!$authentication.authenticated}
              on:click={handleSwithOn}>On</button
            >
            <button
              class="tv-switch off"
              class:switched={!switcher}
              disabled={!$authentication.authenticated}
              on:click={handleSwitchOff}>Off</button
            >
          </div>
        </div>
      </div>
    </div>
    <div class="panel-content no-space-bottom">
      <form class="form" on:submit={handleSubmit}>
        <div class="field">
          <input
            bind:this={userInputRef}
            bind:value={userInput}
            disabled={!$authentication.authenticated ||
              $game?.phase !== "MOVIE_PHASE"}
            class="text-field"
            type="text"
          />
          <button
            class="button"
            disabled={!$authentication.authenticated ||
              $game?.phase !== "MOVIE_PHASE"}
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
  <div class="panel">
    <div class="panel-content no-space-bottom">
      {#if !$authentication.authenticated}
        <button type="button" class="button" on:click={handleJoin}>Join</button>
      {:else}
        <table class="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {#each $players as player (player.name)}
              <tr
                class:answered={$game?.phase !== "END_PHASE" && player.answered}
                class:win={$game?.phase === "END_PHASE" && player.rank === 0}
              >
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
    <button class="button" type="button" on:click={handleSignIn}>Submit</button>
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
    background-color: var(--color-dark-a);
    color: var(--color-dark-a);
    padding: 24px;
    margin-bottom: 24px;
    border-radius: 8px;
    border: 1px solid var(--color-dark-c);
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
    justify-content: space-between;
    width: 100%;
    max-width: 150px;
    background-color: var(--color-dark-a);
    border-radius: 25px;
    padding: 12px;
    border: 10px solid gray;
  }

  /** TV Channel styles */
  .tv-channel {
    color: var(--color-dark-b);
    display: flex;
    justify-content: space-around;
    width: 100%;
    padding: 20px 0 5px;
    align-items: flex-end;
    font-size: 24px;
    font-weight: bold;
  }

  /** TV Switchers */
  .tv-switchers {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .tv-switch {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    text-decoration: none;
    color: var(--color-dark-a);
    font-size: 18px;
    border-radius: 4px;
    width: 100%;
    height: 40px;
    font-weight: bold;
    border: 2px solid var(--color-dark-a);
    transition: 0.3s;
    cursor: pointer;
  }
  .tv-switch:disabled {
    opacity: 0.6;
    cursor: default;
  }
  .tv-switch.on {
    background-color: #448d3c;
    box-shadow: 0px 6px 0px -2px #448d3c;
  }
  .tv-switch.off {
    background-color: #de2d2d;
    box-shadow: 0px 6px 0px -2px #de2d2d;
  }
  .tv-switch.switched {
    box-shadow: 0 0 #fff;
    transform: translateY(1px);
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
    border: 1px solid var(--color-dark-c);
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
    border-bottom: 1px solid var(--color-dark-c);
  }

  .table th {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-inline: 24px;
    background-color: var(--color-dark-c);
  }

  .table tbody > :not(:last-child) {
    border-bottom: 1px solid var(--color-dark-c);
  }

  .table td {
    width: 100%;
    display: flex;
    align-items: center;
    padding-inline: 24px;
  }

  .table tbody tr {
    color: var(--color-dark-c);
    transition: all 0.3s ease;
  }

  .table tbody tr.answered,
  .table tbody tr.win {
    color: var(--color-dark-a);
    background-color: #448d3c;
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

  .button {
    all: unset;
    box-sizing: border-box;
    height: 46px;
    padding-inline: 16px;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.3s ease;
    background-color: inherit;
    border-color: var(--color-dark-c);
    color: var(--color-dark-c);
  }
  .button:not(:disabled):hover {
    background-color: var(--color-dark-c);
    color: var(--color-dark-a);
  }
  .button:disabled {
    opacity: 0.6;
    cursor: default;
  }
</style>
