import HttpService from "./HttpService";

export const LoginService = ({ email, password }) => {
  const http = new HttpService();
  const url = "/api/users/login";
  return http.postData({ email, password, role: ['ADMIN'] }, url);
};