import { useEffect, useState } from 'react';
import UserAPI from '../api/user';
import useAuth from '../context/auth';

const useWalletBalance = () => {
  const { userName } = useAuth();
  const [walletBalance, setWalletBalance] = useState();

  useEffect(() => {
    if (userName) __fetchWalletBalance(setWalletBalance);
  }, [userName]);
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
