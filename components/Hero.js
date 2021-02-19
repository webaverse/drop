import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from "../libs/contextLib";

export default ({heroBg, title, subtitle, callToAction, ctaUrl}) =>
  <div className="heroContainer">
    <div className="heroBg"
      style={{
        background: `url(${heroBg})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100%",
      }}
    />
    <div className="hero">
      <div className="heroTitle">
        <h1></h1>
      </div>
      <div className="leftHeroColumn">
        <model-viewer style={{
	  height: "100%",
          width: "100%",
          WebkitBoxShadow: "#FFF 0 -1px 4px, #ff0 0 -2px 10px, #ff8000 0 -10px 20px, red 0 -18px 40px, 5px 5px 15px 5px rgba(0,0,0,0)",
          boxShadow: "#FFF 0 -1px 4px, #ff0 0 -2px 10px, #ff8000 0 -10px 20px, red 0 -18px 40px, 5px 5px 15px 5px rgba(0,0,0,0)"
	}} className="leftHeroViewer" src="/lightsaber.glb" alt="A 3D model of an light saber" auto-rotate camera-controls></model-viewer>
      </div>
      <div className="rightHeroColumn">
        <div className="rightHeroColumnBoxOne">
          <h1 className="heroTitle">Cryptosaber</h1>
        </div>
        <div className="rightHeroColumnBoxTwo">
          <h2>Artists:</h2>
          <h1>Avaer x Shaw</h1>
        </div>
        <div className="rightHeroColumnBoxThree">
          <h2>The first drop of Webaverse.</h2>
          <a href="https://opensea.io/assets/0x1d963688fe2209a98db35c67a041524822cf04ff/18513"><div style={{ margin: "0 auto", marginTop: "20px" }} className="button">More Info</div></a>
        </div>
      </div>
    </div>
  </div>
