import { batch } from 'react-redux';
import { SET_GENERAL_VALUE } from '../constants/actionTypes';
import { API_URL, API_KEY } from '../constants/general';

export const setGeneralValue = (key, value) => ({
  type: SET_GENERAL_VALUE,
  key,
  value,
});

export const setLoading = (value) => ({
  type: SET_GENERAL_VALUE,
  key: 'isLoading',
  value,
});

export const setError = (value) => ({
  type: SET_GENERAL_VALUE,
  key: 'error',
  value,
});

export const setSearchResult = (value) => ({
  type: SET_GENERAL_VALUE,
  key: 'searchResult',
  value,
});

export const setTotalPages = (value) => ({
  type: SET_GENERAL_VALUE,
  key: 'totalPages',
  value,
});

export const setQuery = (value) => ({
  type: SET_GENERAL_VALUE,
  key: 'query',
  value,
});

export const searchMovies = (query, page) => {
  const url = `${API_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${
    page || 1
  }`;
  return (dispatch) => {
    if (!page) {
      dispatch(setGeneralValue('pageNumber', 0));
    }
    dispatch(setLoading(true));
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          dispatch(setError(data.status_message));
        }
        if (data?.results?.length === 0) {
          dispatch(setError('Nothing found, please try again'));
        }
        batch(() => {
          dispatch(setLoading(false));
          dispatch(setSearchResult(data.results));
          dispatch(setTotalPages(data.total_pages));
        });
      });
  };
};

export const getMovieDetails = (id) => {
  const url = `${API_URL}/movie/${id}?api_key=${API_KEY}`;
  return (dispatch) => {
    dispatch(setLoading(true));
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          dispatch(setError(data.status_message));
        }
        batch(() => {
          dispatch(setLoading(false));
          dispatch(setGeneralValue('movieDetails', data));
        });
      });
  };
};

export const getMovieVideo = (id) => {
  const url = `${API_URL}/movie/${id}/videos?api_key=${API_KEY}`;
  return (dispatch) => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          dispatch(setError(data.status_message));
        }
        dispatch(setGeneralValue('videoKey', data.results[0]?.key));
      });
  };
};

const getPopularMovies = () =>
  new Promise((resolve) => {
    const url = `${API_URL}/movie/popular?api_key=${API_KEY}&page=1`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });

const getTopRatedMovies = () =>
  new Promise((resolve) => {
    const url = `${API_URL}/movie/top_rated?api_key=${API_KEY}&page=1`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => resolve(data));
  });

const getNowPlayingMovies = () =>
  new Promise((resolve) => {
    const url = `${API_URL}/movie/now_playing?api_key=${API_KEY}&page=1`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => resolve(data));
  });

export const getMainPageData = () => {
  return (dispatch) => {
    dispatch(setLoading(true));
    Promise.all([
      getNowPlayingMovies(),
      getPopularMovies(),
      getTopRatedMovies(),
    ]).then((data) => {
      const [nowPlayingData, popularData, topRatedData] = data;
      if (
        nowPlayingData.status_message ||
        popularData.status_message ||
        topRatedData.status_message
      ) {
        dispatch(setLoading(false));
        dispatch(setError('Loading error'));
      } else {
        batch(() => {
          dispatch(setLoading(false));
          dispatch(setGeneralValue('nowPlayingMovies', nowPlayingData.results));
          dispatch(setGeneralValue('popularMovies', popularData.results));
          dispatch(setGeneralValue('topRatedMovies', topRatedData.results));
        });
      }
    });
  };
};
