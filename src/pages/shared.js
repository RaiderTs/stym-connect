import React from 'react';
import SharedHome from '../components/Shared/SharedIndex';
import Layout from '../components/Layout';

export default function Folders() {
  return (
    <Layout>
      <SharedHome />
    </Layout>
  );
}

export async function getStaticProps(context) {
  return {
    props: {
      protected: true,
    },
  };
}
