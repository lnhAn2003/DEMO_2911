import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../src/hooks/useAuth';

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, router]);

  return null;
};

export default Home;
