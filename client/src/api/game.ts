import axios from 'axios';

class GameAPI {
    static async getGameByUuid(uuid: string) {
      return axios.get(`/api/game/${uuid}`);
    }

    static async getValidMoves(uuid: string) {
      return axios.get(`/api/game/moves/${uuid}`);
    }
  
    static async joinGame(uuid: string, blackId: number) {
      return axios.put(`/api/game/join/${uuid}/${blackId}`);
    }
  
    static async move(uuid: string, playerId: number, move: string) {
      return axios.put(`/api/game/move/${uuid}/${playerId}/${move}`);
    }
  
    static async newGame(whiteId: number) {
      return axios.post(`/api/game`, {whiteId});
    }
  }
  
  export default GameAPI;