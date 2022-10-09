import { useEffect, useState } from 'react';
import UserAPI from '../api/user';
import useAuth from '../context/auth';
import useGame from '../context/game';

const useWalletBalance = () => {
  const { userName } = useAuth();
  const { receivedPrize } = useGame();
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (userName) __fetchWalletBalance(setWalletBalance);
  }, [userName, receivedPrize]);
  return { walletBalance };
};

const __fetchWalletBalance = async (setWalletBalance: any) => {
  try {
    const response = await UserAPI.getWalletBalance();
    console.log('FETCHED BALANCE: ', response);
    setWalletBalance(response.data.balance);
  } catch (err) {
    console.log(err);
  }
};

export default useWalletBalance;
