import axios from 'axios';

class UserAPI {
  static async getUserById(id: number) {
    return axios.get(`/api/user/${id}`);
  }

  static async getWalletBalance() {
    return axios.get(`/api/user/balance`);
  }
}

export default UserAPI;
