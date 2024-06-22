import {
  SET_GLOBAL_VARIABLE
} from './actionTypes';

export const setGlobalVariable = (key, value) => {
  return {
    type: SET_GLOBAL_VARIABLE,
    payload: { key, value },
  };
};


