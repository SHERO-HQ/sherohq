import React from "react";

const BlobImage = () => {
  return (
    <svg
      className="absolute lg:h-auto min-h-screen text-slate-200 dark:text-slate-900 opacity-60"
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id="b"
          x="-500"
          y="-500"
          width="2000"
          height="2000"
          filterUnits="userSpaceOnUse"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="100" />
        </filter>
        <filter
          id="a"
          x="-500"
          y="-500"
          width="2000"
          height="2000"
          filterUnits="userSpaceOnUse"
        >
          &gt;
          <feFlood floodColor="currentColor" result="neutral-gray" />
          <feTurbulence
            type=""
            baseFrequency="2"
            numOctaves="100"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="saturate"
            values="0"
            result="destaturatedNoise"
          />
          <feComponentTransfer in="desaturatedNoise" result="theNoise">
            <feFuncA type="table" tableValues="0 0 0.15 0" />
          </feComponentTransfer>
          <feBlend
            in="SourceGraphic"
            in2="theNoise"
            mode="soft-light"
            result="noisy-image"
          />
        </filter>
        <radialGradient id="c" cx="50%" cy="50%" r="50%" fx="77%" fy="36%">
          <stop offset="0%" stopColor="#444cf7" />
          <stop offset="100%" stopColor="rgba(194,68,247,0.2)" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="currentColor" />
      <g filter="url(#a)">
        <g filter="url(#b)">
          <svg
            width="1000"
            height="1000"
            viewBox="0 0 500 500"
            xmlns="http://www.w3.org/2000/svg"
            transform="translate(28.649 457.773)"
          >
            <path
              fill="url(#c)"
              d="M406 333q-60 83-165.5 99.5t-167-83q-61.5-99.5 14-175T268.5 67Q374 35 420 142.5T406 333Z"
            />
          </svg>
        </g>
      </g>
    </svg>
  );
};

export default BlobImage;
