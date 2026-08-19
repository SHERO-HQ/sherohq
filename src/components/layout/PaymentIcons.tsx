import Image from "next/image";

const PaymentIcons = () => {
  const icons = [
    { name: "Visa", src: "/assets/icons/payment/visa.svg", w: 38, h: 12 },
    { name: "Mastercard", src: "/assets/icons/payment/mastercard.svg", w: 20, h: 12 },
    { name: "MTN MoMo", src: "/assets/icons/payment/mtn.png", w: 26, h: 26 },
    { name: "Telecel Cash", src: "/assets/icons/payment/telecelcash.png", w: 16, h: 24 },
  ];

  return (
    <div className="flex items-center gap-3 sm:gap-4 transition-colors duration-300">
      {icons.map((icon) => (
        <div
          key={icon.name}
          className="relative px-1 transition-transform hover:scale-110 flex items-center justify-center h-8"
          title={icon.name}
        >
          <Image
            src={icon.src}
            alt={icon.name}
            width={icon.w}
            height={icon.h}
            style={{ height: `${icon.h}px`, width: 'auto' }}
            className="object-contain w-fit mix-blend-multiply dark:mix-blend-screen transition-opacity duration-300"
          />
        </div>
      ))}
    </div>
  );
};

export default PaymentIcons;
