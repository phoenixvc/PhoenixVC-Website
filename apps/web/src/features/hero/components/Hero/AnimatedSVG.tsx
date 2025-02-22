import React from "react";

const AnimatedSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      viewBox="0 0 1200 600"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <path
          id="phoenix"
          d="M50,25 C60,10 70,5 85,5 C100,5 110,15 120,25 C130,35 135,40 140,45 C145,50 150,55 160,55 C170,55 175,45 180,35 C185,25 190,15 200,15 C210,15 215,25 220,35 C225,45 230,55 240,55 C250,55 255,45 260,35 C265,25 270,15 280,15 C290,15 295,25 300,35 C305,45 310,55 320,55 C330,55 335,45 340,35 C345,25 350,15 360,15"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        <ellipse
          id="egg"
          cx="200"
          cy="300"
          rx="30"
          ry="40"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        <path
          id="flightPath"
          d="M-100,300 C200,100 1000,500 1300,300"
          fill="none"
        />
      </defs>
      <g>
        <use href="#phoenix" fill="none" stroke="white">
          <animateMotion dur="10s" repeatCount="indefinite" rotate="auto">
            <mpath href="#flightPath" />
          </animateMotion>
          <animate attributeName="opacity" values="1;0;1" dur="10s" repeatCount="indefinite" />
          <animate
            attributeName="d"
            values="M50,25 C60,10 70,5 85,5...; M200,260 C200,280 230,320 200,340 C170,320 200,280 200,260; M50,25 C60,10 70,5 85,5..."
            dur="10s"
            repeatCount="indefinite"
          />
        </use>
      </g>
    </svg>
  );
};

export default AnimatedSVG;
