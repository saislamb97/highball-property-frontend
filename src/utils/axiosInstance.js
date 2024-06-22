import axios from "axios";
import { delay } from "redux-saga/effects";
import * as storage from 'src/utils/storage';

window.axios = axios;

export const checkAuthTokens = () => {
  try {
    return storage.get("token");
  } catch(e) {
  }
  return false
};

const axiosInstance = axios.create({
  withCredentials: true
})

axiosInstance.interceptors.request.use(async (req) => {
  if (checkAuthTokens()) {
    req.headers.Authorization = `Bearer ${checkAuthTokens()}`;
  }
  req.headers.requester = req.baseURL;
  req.headers["Access-Control-Allow-Origin"] = "*";
  return req;
});

axiosInstance.interceptors.response.use(
  response => {
    return response.data;
  },
  async (error) => {
    if (error.response.status === 401) {
      storage.remove('token');
      storage.remove('user');
      await delay(1500)
      window.location.href = "/login";
    }
    return Promise.reject(error?.response?.data || error);
  }
);

axiosInstance.upload = async (url, params, options) => {
  const formdata = new FormData()
  const { file, ...param } = params;
  Object.keys(param).forEach(k => formdata.append(k, param[k]));
  formdata.append('file', file);

  return axiosInstance.post(url, formdata, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...options
  })
}

export default axiosInstance;
