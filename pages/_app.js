import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress'; //nprogress module
import 'nprogress/nprogress.css'; //styles of nprogress
import { AppWrapper } from "../libs/contextLib";

import '../styles/globals.css';
import '../styles/home.css';

//Binding events
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const App = ({ Component, pageProps }) => {

  return (
    <AppWrapper>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <div className="appContainer">
        <Component {...pageProps} />
      </div>
    </AppWrapper>
  )
}

export default App;
