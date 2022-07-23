import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import Layout from '../components/Layout';
import authService from '../features/auth/authService';
import { updateToken } from '../features/auth/authSlice';
import { userSelector } from '../selectors/auth';
import { fetchGetJSON } from '../utils/api-helpers';

export default function SubscriptionResult() {
  const [res, setRes] = useState('');
  const router = useRouter();
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  // console.log(user, 'user');
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, error } = useSWR(
    router.query.session_id
      ? `/api/stripe/checkout/${router.query.session_id}`
      : null,
    fetcher
  );
  console.log(data, 'data status');
  useEffect(() => {
    if (data && data.status === 'complete') {
      const payment = async () => {
        const formData = new FormData();
        formData.append('id', data.subscription);

        const response = await fetch(
          'https://api.stymconnect.com/api/payment/stripe',
          {
            headers: {
              authorization: `${user.token}`,
            },
            method: 'POST',
            body: formData,
          }
        );

        const json = await response.json();
        setRes(json);
        if (json.status === true) {
          // const payload = authService.base64decode(json.token);
          // console.log(payload, 'payload');
          const tariff = json.message.includes('pro')
            ? 'pro'
            : json.message.includes('premium')
            ? 'premium'
            : null;

          await dispatch(updateToken({ token: json.token, tariff }));
          router.push('/subscription');

          toast.success('Subscribed successfully!', {
            position: 'bottom-center',
          });
        } else if (
          json.message === 'now_active_tariff_pro' ||
          json.message === 'now_active_tariff_premium'
        ) {
          toast.error("You're on the pro plan!", {
            position: 'bottom-center',
          });
        }
      };
      payment();
    } else {
      console.log('Something went wrong');
    }
  }, [data]);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return (
    <Layout>
      <div className=''>
        <h1>Checkout Payment Result</h1>
        <h2>
          {data?.status === 'complete'
            ? 'Subscribed successfully'
            : 'loading...'}
        </h2>
        {res && (
          <h3>
            {res.message === 'now_active_tariff_pro'
              ? 'Pro tariff already active'
              : ''}
          </h3>
        )}
        {/* <pre>{JSON.stringify(data, null, 2) ?? 'loading...'}</pre> */}
      </div>
    </Layout>
  );
}
