import { combineReducers } from "redux";
import Auth from "./auth/reducer";
import GlobalVariable from "./globalVariables/reducer";

const rootReducer = combineReducers({
  GlobalVariable,
  Auth,
});

export default rootReducer;
