import axios from 'axios';

class AuthAPI {
  static async signUp(username: string) {
    return axios.post(`/api/user/signup`, { username });
  }

  static async connectNode(host: string, cert: string, macaroon: string) {
    return axios.post(`/api/auth/connect`, { host, cert, macaroon });
  }

  static async authenticate() {
    return axios.get(`/api/auth/authenticate`);
  }
}

export default AuthAPI;
