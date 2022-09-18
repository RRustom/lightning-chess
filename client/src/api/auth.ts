import axios from 'axios';

class UserAPI {
    static async signUp(username: string) {
      return axios.post(`/api/user/signup`, {username});
    }
}
  
export default UserAPI;