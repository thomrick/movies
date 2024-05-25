import { writable } from "svelte/store";
import {
  getGamePhase,
  getGamePlayers,
  getGamePreviousMovie,
  type GetGamePhaseResponsePayload,
  type GetGamePlayersResponsePayload,
  type GetGamePreviousMovieResponsePayload,
} from "../api.client";

interface Game extends GetGamePhaseResponsePayload {}

interface PreviousMovie extends GetGamePreviousMovieResponsePayload {}

interface Scoreboard extends GetGamePlayersResponsePayload {}

interface Store {
  game?: Game;
  previousMovie?: PreviousMovie;
  scoreboard: Scoreboard;
  jobId?: NodeJS.Timeout;
}

const store = writable<Store>({
  scoreboard: [],
});

const refresh = async () => {
  const game = await getGamePhase();

  store.update((prev) => ({
    ...prev,
    game,
    jobId: setTimeout(refresh, game.durationToNextPhase),
  }));

  switch (game.phase) {
    case "END_PHASE": {
      const scoreboard = await getGamePlayers();

      store.update((prev) => ({
        ...prev,
        previousMovie: undefined,
        scoreboard,
      }));
      break;
    }
    case "PAUSE_PHASE": {
      const [previousMovie, scoreboard] = await Promise.all([
        getGamePreviousMovie(),
        getGamePlayers(),
      ]);

      store.update((prev) => ({
        ...prev,
        previousMovie,
        scoreboard,
      }));
      break;
    }
    case "MOVIE_PHASE": {
      if (game.phaseNumber === 0) {
        const players = await getGamePlayers();
        store.update((prev) => ({
          ...prev,
          previousMovie: undefined,
          scoreboard: players,
        }));
        break;
      }

      store.update((prev) => ({
        ...prev,
        previousMovie: undefined,
      }));
      break;
    }
    default:
      throw new Error(`Unknown game phase: ${game.phase}`);
  }
};

const start = async () => {
  const game = await getGamePhase();
  const scoreboard = await getGamePlayers();
  store.set({ game, scoreboard, jobId: setTimeout(refresh, game.durationToNextPhase)});
};

const stop = () => {
  const unsubscribe = store.subscribe(({ jobId }) => {
    if (jobId) {
      clearTimeout(jobId);
      store.update((prev) => ({ ...prev, jobId: undefined }));
    }
  });
  unsubscribe();
};

export { store, start, stop };
