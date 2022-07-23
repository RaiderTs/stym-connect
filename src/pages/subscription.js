import React, { useState } from 'react';
import Layout from '../components/Layout';
import Check from '../components/svg/tick.svg';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { useSelector } from 'react-redux';
import { userSelector } from '../selectors/auth';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function Subscriptions() {
  // const [tariff, setTariff] = useState('pro');
  const user = useSelector(userSelector);
  const { tariff = null } = user;

  const handleClick = async (priceId) => {
    // console.log(priceId, 'price id');
    const { sessionId } = await fetch('api/stripe/checkout/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    }).then((res) => res.json());
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });
  };

  return (
    <Layout>
      <h1 className='mb-12 text-4xl font-medium md:text-5xl'>Subscription</h1>
      <div className='flex flex-col items-center gap-4 lg:flex-row xl:justify-center 2xl:gap-10 lg:justify-around '>
        <div
          className={`${
            tariff === 'pro' ? 'bg-my-orange text-white' : ''
          } max-w-[23rem] md:min-w-[12rem] flex flex-col shadow-md justify-between px-8 md:py-8 py-12 border border-my-gray xl:max-w-[35rem] rounded-30 space-y-5 xl:space-y-0 md:min-h-[32rem] `}
        >
          <>
            <h2 className='text-3xl font-medium md:text-2xl xl:text-3xl'>
              Pro
            </h2>
            <span className='text-base font-medium md:text-base'>
              Peer-to-Peer collaboration&#9;&#9;&#9;&#9;&#9;
            </span>
          </>
          <div className='space-y-2 text-sm md:text-xs'>
            <div className='flex items-center gap-3'>
              <Check className='w-5' />
              <b>5 TB</b> storage
            </div>
            <div className='flex items-center gap-3'>
              <Check className='w-5' />
              For one person
            </div>
            <div className='flex items-center gap-3'>
              <Check className='w-5' />
              No size limit of transfers
            </div>
            <div className='flex items-center gap-3'>
              <Check className='w-5' />
              Unlimited portal tokens
            </div>
            <div className='flex items-center gap-3'>
              <Check className='w-5' />
              Unlimited email access to customer support
            </div>
          </div>
          <hr className='w-4/5 mx-auto text-slate-700 border-red' />
          <div className='flex flex-col'>
            <span className='mb-2 text-2xl font-medium md:text-2xl xl:text-3xl '>
              US $10
            </span>
            <span>monthly</span>
          </div>

          <button
            role='link'
            onClick={() => handleClick('price_1Kg6vRJXGHF6MX8O7596O604')}
            className={`${
              tariff === 'pro' ? 'bg-white pointer-events-none' : ''
            } p-4 md:p-2 font-medium transition-colors duration-500 border hover:bg-my-orange hover:text-white text-my-orange rounded-30 border-my-orange`}
          >
            {tariff === 'pro' ? 'Current plan' : 'Buy now'}
          </button>
        </div>

        {/* // * PREMIUM */}

        <div
          className={`${
            tariff === 'premium' ? 'bg-my-orange text-white' : ''
          } max-w-[23rem] md:min-w-[12rem]  xl:max-w-[26rem]  flex flex-col shadow-md justify-between px-8 py-12 md:py-8 border border-my-gray rounded-30 space-y-5 xl:space-y-0 md:min-h-[32rem]`}
        >
          <>
            <h2 className='text-3xl font-medium xl:mb-0 md:text-2xl xl:text-3xl'>
              Premium
            </h2>
            <span className='text-base font-medium md:text-base'>
              Asset management for your team
            </span>
          </>
          <div className='space-y-2 text-sm md:text-xs'>
            <div className='flex items-center gap-3'>
              <Check className='w-5 ' /> <b>10 TB</b> storage
            </div>
            <div className='flex items-center gap-3'>
              <Check className='w-5 ' /> For 5 person
            </div>
            <div className='flex items-center gap-3'>
              <Check className='w-5 ' />
              No size limit of transfers
            </div>
            <div className='flex items-center gap-3'>
              <Check className='w-5 ' />
              Unlimited portal tokens
            </div>
            <div className='flex items-start gap-3 xl:items-center'>
              <Check className='w-7 xl:w-5' />
              Unlimited email access to customer support
            </div>
          </div>
          <hr className='w-4/5 mx-auto text-slate-700 border-red' />
          <div className='flex flex-col'>
            <div className='flex items-baseline gap-4'>
              <span className='text-xs line-through md:text-base whitespace-nowrap'>
                US $65
              </span>
              <span className='mb-2 text-xl font-medium xl:text-3xl '>
                US $30
              </span>
              <span className='text-xs xl:text-lg'>Early sign up</span>
            </div>
            <span className='text-base xl:text-xl'>monthly</span>
          </div>
          <button
            role='link'
            onClick={() => handleClick('price_1Kg6xGJXGHF6MX8OqlM5jGPN')}
            className={`${
              tariff === 'premium' ? 'bg-white pointer-events-none' : ''
            } p-4 md:p-2 font-medium transition-colors duration-500 border hover:bg-my-orange hover:text-white text-my-orange rounded-30 border-my-orange`}
          >
            {tariff === 'premium' ? 'Current plan' : 'Buy now'}
          </button>
        </div>

        {/* // * ENTERPRISE */}

        <div
          className={`${
            tariff === 'enterprise' ? 'bg-my-orange text-white' : ''
          } max-w-[23rem] md:min-w-[12rem] xl:max-w-[26rem]  flex flex-col shadow-md justify-between px-8 py-12 md:py-8 border border-my-gray rounded-30 space-y-5 xl:space-y-0 md:min-h-[32rem]`}
        >
          <>
            <h2 className='text-3xl font-medium md:text-2xl xl:text-3xl'>
              Enterprise
            </h2>
            <span className='text-base font-medium enterprise-mt md:text-base'>
              Workflow, your way
            </span>
          </>
          <div className='space-y-2 text-sm md:text-xs'>
            <div className='flex items-center gap-3'>
              <Check className='w-5' />
              <b>No size limit transfers</b>
            </div>
            <div className='flex items-center gap-3'>
              <Check className='w-5' />
              Unlimited Storage
            </div>
            <div className='flex items-center gap-3'>
              <Check className='w-5' />
              Unlimited portal tokens
            </div>
            <div className='flex items-start gap-3 xl:items-center'>
              <Check className='w-7 xl:w-5' />
              Unlimited email access to customer support
            </div>
          </div>
          <hr className='w-4/5 mx-auto text-slate-700 border-red' />
          <div className='flex flex-col'>
            <span className='mb-2 text-3xl font-medium md:text-3xl'>
              Contact Us
            </span>
          </div>
          <a
            href='https://stymconnect.com/#pricing'
            rel='noopener noreferrer'
            target='_blank'
            className={`${
              tariff === 'enterprise' ? 'bg-white pointer-events-none' : ''
            } p-4 md:p-2 font-medium transition-colors duration-500 text-center border hover:bg-my-orange hover:text-white text-my-orange rounded-30 border-my-orange`}
          >
            {tariff === 'enterprise' ? 'Current plan' : 'Buy now'}
          </a>
        </div>
      </div>
    </Layout>
  );
}
