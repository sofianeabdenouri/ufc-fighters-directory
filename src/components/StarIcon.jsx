import React from "react";

const StarIcon = ({ filled = false, ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={32}
    height={32}
    fill={filled ? "#FFC006" : "none"}
    stroke={filled ? "#FFC006" : "#888"}
    strokeWidth={2}
    strokeLinejoin="round"
    strokeLinecap="round"
    {...props}
  >
    <polygon
      points="16,3 20,12 30,12 22,18 25,28 16,22 7,28 10,18 2,12 12,12"
    />
  </svg>
);

export default StarIcon;
