import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16 31C24.2843 31 31 24.2843 31 16C31 7.71573 24.2843 1 16 1C7.71573 1 1 7.71573 1 16C1 24.2843 7.71573 31 16 31Z"
        fill="url(#paint0_linear_1_2)"
        stroke="url(#paint1_linear_1_2)"
        strokeWidth="2"
      />
      <path
        d="M21 11H11C9.89543 11 9 11.8954 9 13V18C9 19.1046 9.89543 20 11 20H19L23 24V13C23 11.8954 22.1046 11 21 11Z"
        fill="white"
        fillOpacity="0.8"
      />
      <path
        d="M19.5 16.5H18"
        stroke="#673AB7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 16.5H14"
        stroke="#673AB7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 16.5H10"
        stroke="#673AB7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1_2"
          x1="1"
          y1="1"
          x2="31"
          y2="31"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#673AB7" />
          <stop offset="1" stopColor="#4527A0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1_2"
          x1="16"
          y1="1"
          x2="16"
          y2="31"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A385E0" />
          <stop offset="1" stopColor="#673AB7" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
