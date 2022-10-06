import axios from 'axios';

class AuthAPI {
  static async signUp(username: string) {
    return axios.post(`/api/user/signup`, { username });
  }

  static async connectNode(host: string, cert: string, macaroon: string) {
    return axios.post(`/api/lnd/connect`, { host, cert, macaroon });
  }
}

export default AuthAPI;
