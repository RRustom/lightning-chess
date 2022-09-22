import axios from 'axios';

class AuthAPI {
  static async signUp(username: string) {
    return axios.post(`/api/user/signup`, { username });
  }
}

export default AuthAPI;
