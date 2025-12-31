const ConstructionIcon = () => {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-24 h-24 mx-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="56"
        stroke="currentColor"
        strokeWidth="4"
        className="text-primary"
      />

      <path
        d="M40 65 L55 50 L70 65 L85 50"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary animate-pulse"
      />

      <rect
        x="45"
        y="70"
        width="30"
        height="8"
        rx="4"
        className="fill-primary/80"
      />
    </svg>
  );
};

export default ConstructionIcon;
