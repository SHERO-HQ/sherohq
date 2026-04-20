const PaymentIcons = () => {
  const icons = [
    { name: "Visa", src: "/assets/icons/payment/visa.svg", h: 12 },
    { name: "Mastercard", src: "/assets/icons/payment/mastercard.svg", h: 12 },
    { name: "MTN MoMo", src: "/assets/icons/payment/mtn.png", h: 26 },
    { name: "Telecel Cash", src: "/assets/icons/payment/telecelcash.png", h: 24 },
  ];

  return (
    <div className="flex items-center gap-3 sm:gap-4 transition-all duration-500">
      {icons.map((icon) => (
        <div
          key={icon.name}
          className="relative px-1 transition-transform hover:scale-110 flex items-center justify-center h-8"
          title={icon.name}
        >
          <img
            src={icon.src}
            alt={icon.name}
            style={{ height: `${icon.h}px`, width: 'auto' }}
            className="object-contain w-fit mix-blend-multiply dark:mix-blend-screen transition-all duration-500"
          />
        </div>
      ))}
    </div>
  );
};

export default PaymentIcons;
