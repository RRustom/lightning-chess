import axios from 'axios';

class UserAPI {
  static async getUserById(id: number) {
    return axios.get(`/api/user/${id}`);
  }
}

export default UserAPI;
