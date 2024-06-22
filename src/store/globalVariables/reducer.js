import { SET_GLOBAL_VARIABLE } from './actionTypes';

const initialState = {
  user: null,
  view_types: ['KLCC','TRX','Golf View','City View','No View'],
  furnish_types: ['FULL_FURNISHED','HALF_FURNISHED','NOT_FURNISHED'],
};

const GlobalVariable = (state = initialState, action) => {
  switch (action.type) {
    case SET_GLOBAL_VARIABLE:
      state = {
        ...state,
        [action.payload.key]: action.payload.value
      };
      break;

    default:
      state = { ...state };
      break;
  }
  return state;
};

export default GlobalVariable;
