import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Hero from "../components/Hero";

export default () => {
 return (
    <>
      <Head>
        <title>Webaverse</title>
        <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js" />
        <meta name="description" content={"The virtual world built with NFTs."} />
        <meta property="og:title" content={"Webaverse"} />
        <meta property="og:image" content={"https://webaverse.com/webaverse.png"} />
        <meta name="theme-color" content="#c4005d" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Hero
        heroBg=""
        title=""
        subtitle=""
        callToAction=""
        ctaUrl=""
      />
      <div className="windowContainer">
        <h1>Season 1</h1>
      </div>
      <div className="windowContainer">
        <img className="windowImage" src="/window.jpg" />
        <img className="windowImage" src="/window.jpg" />
        <img className="windowImage" src="/window.jpg" />
        <img className="windowImage" src="/window.jpg" />

        <img className="windowImage" src="/window.jpg" />
        <img className="windowImage" src="/window.jpg" />
        <img className="windowImage" src="/window.jpg" />
        <img className="windowImage" src="/window.jpg" />
      </div>
    </>
  )
}
