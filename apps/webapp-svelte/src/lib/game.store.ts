import { get, writable } from "svelte/store";
import {
  getGamePhase,
  getGamePlayers,
  getGamePreviousMovie,
  postGameAnswer,
  type GetGamePhaseResponsePayload,
  type GetGamePlayersResponsePayload,
  type GetGamePreviousMovieResponsePayload,
} from "./api.client";

interface Game extends GetGamePhaseResponsePayload {}

interface PreviousMovie extends GetGamePreviousMovieResponsePayload {}

interface Players extends GetGamePlayersResponsePayload {}

const game = writable<Game | undefined>(undefined);
const previousMovie = writable<PreviousMovie | undefined>(undefined);
const players = writable<Players>([]);
const jobId = writable<NodeJS.Timeout | undefined>(undefined);

const refresh = async () => {
  const newGame = await getGamePhase();
  jobId.set(setTimeout(refresh, newGame.durationToNextPhase));
  game.set(newGame);

  switch (newGame.phase) {
    case "END_PHASE": {
      players.set(await getGamePlayers());
      break;
    }
    case "PAUSE_PHASE": {
      const [newPreviousMovie, newPlayers] = await Promise.all([
        getGamePreviousMovie(),
        getGamePlayers(),
      ]);

      previousMovie.set(newPreviousMovie);
      players.set(newPlayers);
      break;
    }
    case "MOVIE_PHASE": {
      getGamePlayers().then(players.set);
      previousMovie.set(undefined);
      break;
    }
    case "INIT_PHASE": {
      players.set(await getGamePlayers());
      break;
    }
    default:
      throw new Error(`Unknown game phase: ${newGame.phase}`);
  }
};

const start = async () => {
  const [newGame, newPlayers] = await Promise.all([
    getGamePhase(),
    getGamePlayers(),
  ]);
  game.set(newGame);
  players.set(newPlayers);
  jobId.set(setTimeout(refresh, newGame.durationToNextPhase));
};

const stop = () => {
  const unsubscribe = jobId.subscribe((value) => {
    if (value) {
      clearTimeout(value);
      jobId.set(undefined);
      players.set([]);
      game.set(undefined);
      previousMovie.set(undefined);
    }
  });
  unsubscribe();
};

const guess = async (value: string) => {
  const { message } = await postGameAnswer({ title: value });
  getGamePlayers().then(players.set);
  return message;
};

export { game, guess, players, previousMovie, start, stop };
