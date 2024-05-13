<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { getGamePhase, getGamePreviousMovie } from "./lib/api.client";

  const hostname = import.meta.env.VITE_HOSTNAME || "https://movies.moum.it";

  interface Game {
    phase: "PAUSE_PHASE" | "MOVIE_PHASE" | "END_PHASE";
    durationFromStart: number;
    durationToNextPhase: number;
    phaseNumber: number;
    totalPhase: number;
  }

  interface PreviousMovie {
    title: string;
    frenchTitle: string;
    posterUrl: string;
  }

  let game: Game | undefined = undefined;
  let previous: PreviousMovie | undefined = undefined;

  onMount(() => {
    handleRefreshPhase();
  });

  const handleRefreshPhase = async () => {
    game = await getGamePhase();

    setTimeout(handleRefreshPhase, game?.durationToNextPhase);

    if (game?.phase === "PAUSE_PHASE") {
      await handleRefreshResponse();
    }
  };

  const handleRefreshResponse = async () => {
    previous = await getGamePreviousMovie();
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    console.log("TRT", "handleSubmit");
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
          {#if game?.phase === "PAUSE_PHASE"}
            <img
              in:fly={{ y: 200, delay: 500, duration: 2000 }}
              src={previous?.posterUrl}
              alt={previous?.title}
            />
          {:else if game?.phase === "MOVIE_PHASE"}
            <!-- svelte-ignore a11y-media-has-caption -->
            <video
              in:fade={{ duration: 1000 }}
              src={`${hostname}/game/current-movie`}
              autoplay
            />
          {/if}
        </div>
        <div class="tv-controls">
          <button>On</button>
        </div>
      </div>
    </div>
    <div class="panel-content">
      <form class="form" on:submit={handleSubmit}>
        <div class="field">
          <input
            disabled={game?.phase !== "MOVIE_PHASE"}
            class="text-field"
            type="text"
          />
          <button
            disabled={game?.phase !== "MOVIE_PHASE"}
            class="button"
            type="submit">Submit</button
          >
        </div>
      </form>
    </div>
  </div>
  <div class="panel">
    <div class="panel-content">
      <table class="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Test A</td>
            <td>0</td>
          </tr>
          <tr>
            <td>Test B</td>
            <td>0</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</main>

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

  .tv {
    width: 100%;
    background-color: #a52a2a;
    padding: 24px;
    border-radius: 50px;
    display: flex;
    gap: 24px;

    background-color: #a52a2a;
    background-image: url("https://www.transparenttextures.com/patterns/wood-pattern.png");
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

    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-dark-a);
    border: 10px solid var(--color-dark-a);
    border-radius: 150px;
    overflow: hidden;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  video {
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

  .button {
    all: unset;
    height: 48px;
    padding-inline: 16px;
    background-color: var(--color-dark-a);
    border-radius: 4px;
    color: var(--color-dark-c);
    font-weight: bold;
    cursor: pointer;
  }
  .button:disabled {
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
</style>
