const hostname = import.meta.env.VITE_HOSTNAME || "https://movies.moum.it";

export interface PostGameAnswerRequestPayload {
  title: string;
}

export interface PostGameAnswerResponsePayload {
  message: string;
}

export const postGameAnswer = async (
  payload: PostGameAnswerRequestPayload
): Promise<PostGameAnswerResponsePayload> => {
  const response = await fetch(`${hostname}/game/answer`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
};

export const getGameCurrentMovie = (): string => {
  return `${hostname}/game/current-movie`;
};

export interface GetGamePhaseResponsePayload {
  phase: "PAUSE_PHASE" | "MOVIE_PHASE" | "END_PHASE";
  durationFromStart: number;
  durationToNextPhase: number;
  phaseNumber: number;
  totalPhase: number;
}

export const getGamePhase = async (): Promise<GetGamePhaseResponsePayload> => {
  const response = await fetch(`${hostname}/game/phase`);

  return await response.json();
};

export interface GetGamePreviousMovieResponsePayload {
  title: string;
  frenchTitle: string;
  posterUrl: string;
}

export const getGamePreviousMovie =
  async (): Promise<GetGamePreviousMovieResponsePayload> => {
    const response = await fetch(`${hostname}/game/previous-movie`);

    return await response.json();
  };

export interface GamePlayerScoreboard {
  answered: boolean;
  bonus: boolean;
  name: string;
  rank: number;
  score: number;
  totalWin: number;
}

export interface GetGamePlayersResponsePayload extends Array<GamePlayerScoreboard> {}

export const getGamePlayers =
  async (): Promise<GetGamePlayersResponsePayload> => {
    const response = await fetch(`${hostname}/game/players`);

    return await response.json();
  };

export interface PostLoginRequestPayload {
  username: string;
}

export interface PostLoginResponsePayload {
  message: string;
}

export const postLogin = async (
  payload: PostLoginRequestPayload
): Promise<PostLoginResponsePayload> => {
  const response = await fetch(`${hostname}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
};
