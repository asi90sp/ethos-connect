import React from 'react'

const Ethos = ({ width = 24, color = '#1e293b' }: { width?: number; color?: string }) => (
  <svg
    width={width}
    height={(width * 65) / 47}
    viewBox="0 0 47 65"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.00471 1H40.0029C42.7644 1 45.0029 3.23858 45.0029 6V44.8425C45.0029 47.604 42.7643 49.8425 40.0029 49.8425H6.0047C3.24328 49.8425 1.0047 47.604 1.0047 44.8425V6C1.0047 3.23858 3.24329 1 6.00471 1Z"
      stroke="url(#paint0_linear_83_95)"
      strokeWidth="2"
    />
    <path
      d="M6.68764 3.64648L30.6631 14.8026C32.0736 15.4589 32.9756 16.8735 32.9756 18.4292V58.6799C32.9756 61.5743 29.9966 63.5105 27.3515 62.3353L3.37601 51.683C1.93126 51.0411 1.00013 49.6085 1.00013 48.0276V7.27309C1.00013 4.34854 4.03609 2.41268 6.68764 3.64648Z"
      fill={color}
    />
    <defs>
      <linearGradient
        id="paint0_linear_83_95"
        x1="45.0029"
        y1="14"
        x2="23.0029"
        y2="25"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={color} />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
)

export default Ethos
