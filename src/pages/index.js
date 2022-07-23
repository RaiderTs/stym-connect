import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { userSelector } from '../selectors/auth';
import StymIndex from '../components/Mystym/StymIndex';

function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(userSelector);
  const stym = useSelector((state) => state);
  const { isLoading } = useSelector((state) => state.auth);

  return (
    <Layout>
      <StymIndex />
    </Layout>
  );
}

export default Home;
