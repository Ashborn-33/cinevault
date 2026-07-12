export const TMDB_ENDPOINTS = {
  TRENDING: "/trending/all/day",
  POPULAR_MOVIES: "/movie/popular",
  POPULAR_TV: "/tv/popular",
  SEARCH: "/search/multi",
  MOVIE_DETAILS: (id: string | number) => `/movie/${id}`,
  TV_DETAILS: (id: string | number) => `/tv/${id}`,
  GENRES_MOVIE: "/genre/movie/list",
  GENRES_TV: "/genre/tv/list",
  UPCOMING: "/movie/upcoming",
  NOW_PLAYING: "/movie/now_playing",
  TOP_RATED_MOVIES: "/movie/top_rated",
  TOP_RATED_TV: "/tv/top_rated",
} as const
