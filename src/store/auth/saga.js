import { takeEvery, fork, put, all, call } from "redux-saga/effects";
import { LOGIN, LOGOUT_USER } from "./actionTypes";
import { apiError, loginUserSuccessful, logoutUserSuccess } from "./actions";
import { LoginService } from "../../services/authServices";
import * as storage from 'src/utils/storage';

function* loginUser({ payload }) {
  try {
    const response = yield call(LoginService, payload);
    storage.remove("token");
    storage.remove("user");
    if (payload.remember) {
      storage.local.set("token", response.token);
      storage.local.set("user", response.user);
    } else {
      storage.session.set("token", response.token);
      storage.session.set("user", response.user);
    }
    yield put(loginUserSuccessful(response));
  } catch (error) {
    console.log(111, error);
    yield put(apiError(error?.message));
  }
}

function* logoutUser({ payload: { history } }) {
  try {
    storage.remove("token");
    storage.remove("user");

    yield put(logoutUserSuccess());
    history.push("/login");
  } catch (error) {
    yield put(apiError(error));
  }
}


export function* watchUserLogin() {
  yield takeEvery(LOGIN, loginUser);
}

export function* watchUserLogout() {
  yield takeEvery(LOGOUT_USER, logoutUser);
}

function* AuthSaga() {
  yield all([
    fork(watchUserLogin),
    fork(watchUserLogout),
  ]);
}

export default AuthSaga;
