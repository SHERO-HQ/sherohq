const BlobImage = () => {
  return (
    <svg
      className="absolute lg:h-auto min-h-screen text-slate-200 dark:text-slate-900 opacity-50"
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="blob-gradient">
          <stop offset="0%" stopColor="#444cf7" />
          <stop offset="100%" stopColor="rgba(194,68,247,0.2)" />
        </radialGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="currentColor" />
      
      {/* No filters - pure gradient blob */}
      <path
        fill="url(#blob-gradient)"
        d="M406 333q-60 83-165.5 99.5t-167-83q-61.5-99.5 14-175T268.5 67Q374 35 420 142.5T406 333Z"
        transform="translate(28.649 457.773) scale(2)"
        style={{ filter: 'blur(50px)' }}
      />
    </svg>
  );
};

export default BlobImage