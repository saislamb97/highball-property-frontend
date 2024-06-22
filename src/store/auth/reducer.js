import {
  LOGOUT_USER,
  LOGIN,
  LOGIN_USER_SUCCESSFUL,
  LOGOUT_USER_SUCCESSFULLY,
  API_ERROR,
  AUTH_ERROR,
} from "./actionTypes";
import { checkAuthTokens } from '../../utils/axiosInstance';
import * as storage from 'src/utils/storage';

const initialState = {
  user: null,
  loginError: null,
  activationError: null,
  isAuthenticated: !!checkAuthTokens(),
  message: null,
  loading: false,
};

const Auth = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      state = {
        ...state,
        loginError: null,
        loading: true,
        activationError: null,
        isAuthenticated: false,
      };
      break;
    case LOGIN_USER_SUCCESSFUL:
      state = {
        ...state,
        user: action.payload,
        loading: false,
        activationError: null,
        isAuthenticated: true,
      };
      break;

    case LOGOUT_USER:
      state = { ...state, loading: true, user: null };
      break;

    case LOGOUT_USER_SUCCESSFULLY:
      state = {
        ...state,
        user: null,
        loginError: null,
        activationError: null,
        isAuthenticated: false,
        message: null,
        loading: false,
      };
      break;
      
    case API_ERROR:
      state = {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        message: null,
        loginError: action.payload,
        activationError: null,
      };
      break;

    case AUTH_ERROR:
      storage.remove("token");
      storage.remove("user");
      state = {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        message: null,
        loginError: action.payload,
      };
      break;

    default:
      state = { ...state };
      break;
  }
  return state;
};

export default Auth;
