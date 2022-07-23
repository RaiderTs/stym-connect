import React from 'react';
import dynamic from 'next/dynamic';

const DynamicComponentWithNoSSR = dynamic(
  () => import('../components/CollabsChat'),
  { ssr: false }
);

export default function Collabs() {
  return <DynamicComponentWithNoSSR />;
}
