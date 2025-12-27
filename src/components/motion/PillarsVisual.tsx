import { useState, useEffect } from "react";
import { easeInOut } from "motion";
import * as motion from "motion/react-client";
import type { Variants } from "motion";

// Extract variants outside component
const starVariants: Variants = {
  animate: (i: number) => ({
    opacity: [1],
    scale: [0.5, 1, 0.5],
    transition: {
      duration: 2 + i,
      repeat: Infinity,
      ease: easeInOut,
      delay: i * 0.2,
    },
  }),
  static: {
    opacity: 1,
    scale: 1,
  },
};

const PillarsVisual: React.FC = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const animationState = prefersReducedMotion ? "static" : "animate";

  return (
    <motion.svg
      width="759"
      height="460"
      viewBox="0 0 759 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="dark:text-slate-900 text-slate-100 mx-auto w-full h-full"
      role="img"
      aria-label="Five pillars of innovation diagram"
      focusable="false"
    >
      <title>Pillars Visual</title>
      <desc>Geometric diagram showing five interconnected pillars</desc>

      <g id="Element">
        <path
          className="dark:text-slate-900 text-blue-200"
          id="Ellipse 14"
          d="M679.368 375.803C679.368 210.19 545.112 75.9351 379.5 75.9351C213.888 75.9351 79.6326 210.19 79.6326 375.803"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="15 15"
        />
        <line
          className="dark:text-slate-900 text-blue-200"
          id="Line 3"
          x1="78.0071"
          y1="374.302"
          x2="679.367"
          y2="374.302"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="15 15"
        />
        <line
          className="dark:text-slate-900 text-blue-200"
          id="Line 4"
          x1="200.31"
          y1="134.384"
          x2="326.271"
          y2="309.916"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="15 15"
        />
        <line
          className="dark:text-slate-900 text-blue-200"
          id="Line 6"
          x1="392.5"
          y1="75.5325"
          x2="392.5"
          y2="307.532"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="15 15"
        />
        <line
          className="dark:text-slate-900 text-blue-200"
          id="Line 5"
          x1="580.97"
          y1="153.349"
          x2="456.252"
          y2="310.909"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="15 15"
        />
        <rect
          className="dark:text-slate-900 text-blue-200"
          id="Rectangle 367"
          x="324.115"
          y="309.04"
          width="133.525"
          height="133.525"
          rx="8.5"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="15 15"
        />
        <g id="Rectangle 368" filter="url(#filter0_d_538_178)">
          <rect
            className="drop-shadow"
            x="350.245"
            y="335.17"
            width="81.2649"
            height="81.2649"
            rx="10"
            fill="currentColor"
          />
        </g>
        <g id="Rectangle 369" filter="url(#filter1_d_538_178)">
          <rect
            className="drop-shadow"
            x="39"
            y="335.17"
            width="81.2649"
            height="81.2649"
            rx="10"
            fill="currentColor"
          />
        </g>
        <g id="Frame">
          <path
            id="Vector"
            d="M71.5938 354.624V358.186M62.6875 367.093H59.125M101.875 367.093H98.3125M62.6875 375.999H59.125M101.875 375.999H98.3125M62.6875 384.905H59.125M101.875 384.905H98.3125M71.5938 393.811V397.374M80.5 354.624V358.186M80.5 393.811V397.374M89.4062 354.624V358.186M89.4062 393.811V397.374M68.0312 393.811H92.9688C94.386 393.811 95.7452 393.248 96.7474 392.246C97.7495 391.244 98.3125 389.885 98.3125 388.468V363.53C98.3125 362.113 97.7495 360.754 96.7474 359.751C95.7452 358.749 94.386 358.186 92.9688 358.186H68.0312C66.614 358.186 65.2548 358.749 64.2526 359.751C63.2505 360.754 62.6875 362.113 62.6875 363.53V388.468C62.6875 389.885 63.2505 391.244 64.2526 392.246C65.2548 393.248 66.614 393.811 68.0312 393.811ZM69.8125 365.311H91.1875V386.686H69.8125V365.311Z"
            stroke="#4F9CF9"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <g id="Rectangle 370" filter="url(#filter2_d_538_178)">
          <rect
            className="drop-shadow"
            x="638.735"
            y="335.17"
            width="81.2649"
            height="81.2649"
            rx="10"
            fill="currentColor"
          />
        </g>
        <g id="Rectangle 371" filter="url(#filter3_d_538_178)">
          <rect
            className="drop-shadow"
            x="538.779"
            y="94.626"
            width="81.2649"
            height="81.2649"
            rx="10"
            fill="currentColor"
          />
        </g>
        <g id="Frame_2">
          <path
            id="Vector_2"
            d="M559.65 127.9C558.962 133.164 558.553 138.46 558.422 143.767C565.619 146.774 572.51 150.466 579 154.792C585.49 150.466 592.382 146.774 599.58 143.767C599.45 138.46 599.04 133.164 598.352 127.9M598.352 127.9C600.54 127.165 602.757 126.485 604.997 125.865C596.839 120.146 588.13 115.255 579 111.265C569.87 115.255 561.161 120.147 553.002 125.867C555.236 126.484 557.451 127.162 559.647 127.9C566.319 130.143 572.792 132.938 579 136.255C585.207 132.938 591.682 130.143 598.352 127.9ZM565.875 140.032C566.372 140.032 566.849 139.835 567.201 139.483C567.552 139.132 567.75 138.655 567.75 138.157C567.75 137.66 567.552 137.183 567.201 136.832C566.849 136.48 566.372 136.282 565.875 136.282C565.378 136.282 564.901 136.48 564.549 136.832C564.197 137.183 564 137.66 564 138.157C564 138.655 564.197 139.132 564.549 139.483C564.901 139.835 565.378 140.032 565.875 140.032ZM565.875 140.032V130.845C570.117 128.208 574.498 125.803 579 123.64M561.482 152.515C562.877 151.123 563.984 149.47 564.737 147.65C565.491 145.829 565.878 143.878 565.875 141.907V138.157"
            stroke="#4F9CF9"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <g id="Rectangle 372" filter="url(#filter4_d_538_178)">
          <rect
            className="drop-shadow"
            x="158.459"
            y="94.626"
            width="81.2649"
            height="81.2649"
            rx="10"
            fill="currentColor"
          />
        </g>
        <g id="Rectangle 373" filter="url(#filter5_d_538_178)">
          <rect
            className="drop-shadow"
            x="356"
            y="35"
            width="81.2649"
            height="81.2649"
            rx="10"
            fill="currentColor"
          />
        </g>
        <g id="Frame_3">
          <path
            id="Vector_3"
            d="M696.299 381.165C700 377.464 702.333 374.366 702.333 369.699C702.333 367.103 701.546 364.567 700.074 362.428C698.603 360.288 696.518 358.645 694.093 357.716C691.668 356.787 689.019 356.615 686.495 357.223C683.97 357.831 681.69 359.19 679.954 361.122M696.299 381.165C695.839 381.625 695.293 381.99 694.691 382.24C694.09 382.489 693.446 382.617 692.795 382.617C692.144 382.617 691.499 382.489 690.898 382.24C690.297 381.99 689.75 381.625 689.29 381.165C689.788 381.616 690.19 382.163 690.47 382.773C690.75 383.384 690.904 384.045 690.92 384.717C690.937 385.388 690.818 386.056 690.568 386.68C690.319 387.304 689.946 387.87 689.47 388.345C688.995 388.82 688.429 389.194 687.805 389.443C687.181 389.693 686.513 389.812 685.842 389.795C685.17 389.779 684.509 389.625 683.898 389.345C683.288 389.065 682.741 388.663 682.29 388.165C682.751 388.624 683.116 389.169 683.366 389.769C683.616 390.369 683.745 391.013 683.746 391.663C683.747 392.313 683.619 392.957 683.371 393.558C683.123 394.159 682.759 394.705 682.299 395.165C681.856 395.609 681.328 395.958 680.746 396.193C680.165 396.428 679.542 396.543 678.915 396.532C678.288 396.52 677.669 396.383 677.097 396.127C676.524 395.871 676.009 395.503 675.582 395.044L662.667 382.532C659.167 379.032 655.667 375.066 655.667 369.699C655.667 367.103 656.455 364.568 657.927 362.429C659.398 360.289 661.484 358.647 663.908 357.718C666.333 356.789 668.982 356.617 671.506 357.225C674.03 357.833 676.31 359.193 678.046 361.124C678.305 361.365 678.646 361.499 679.001 361.499C679.355 361.498 679.696 361.363 679.954 361.122M696.299 381.165C697.174 380.29 697.666 379.103 697.666 377.866C697.666 376.628 697.174 375.442 696.299 374.566L691.91 370.175C691.388 369.653 690.768 369.238 690.086 368.955C689.403 368.673 688.672 368.527 687.933 368.527C687.195 368.527 686.463 368.673 685.781 368.955C685.098 369.238 684.478 369.653 683.956 370.175L679.966 374.165C679.091 375.04 677.904 375.531 676.667 375.531C675.429 375.531 674.243 375.04 673.367 374.165C672.493 373.29 672.001 372.103 672.001 370.866C672.001 369.628 672.493 368.442 673.367 367.566L679.954 361.122"
            stroke="#4F9CF9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <motion.circle
          variants={starVariants}
          animate={animationState}
          custom={1}
          id="Ellipse 15"
          cx="644.002"
          cy="233.501"
          r="13.0024"
          fill="#068C5E"
        />
        <motion.circle
          variants={starVariants}
          animate={animationState}
          custom={2}
          id="Ellipse 16"
          cx="115.002"
          cy="234.501"
          r="13.0024"
          fill="#043873"
        />
        <motion.circle
          variants={starVariants}
          animate={animationState}
          custom={3}
          id="Ellipse 18"
          cx="233.002"
          cy="375.501"
          r="13.0024"
          fill="#068C5E"
        />
        <motion.circle
          variants={starVariants}
          animate={animationState}
          custom={4}
          id="Ellipse 17"
          cx="562.346"
          cy="375.802"
          r="13.0024"
          fill="#043873"
        />
        <g id="Logo Icon" clipPath="url(#clip0_538_178)">
          <g id="Shero (Logo)">
            <g id="Group">
              <g id="Clip path group">
                <mask
                  id="mask0_538_178"
                  style={{ maskType: "luminance" }}
                  maskUnits="userSpaceOnUse"
                  x="363"
                  y="339"
                  width="59"
                  height="78"
                >
                  <g id="77af655d8e">
                    <path
                      id="Vector_4"
                      d="M422 339.932H363V416.811H422V339.932Z"
                      fill="white"
                    />
                  </g>
                </mask>
                <g mask="url(#mask0_538_178)">
                  <g id="Group_2">
                    <g id="Clip path group_2">
                      <mask
                        id="mask1_538_178"
                        style={{ maskType: "luminance" }}
                        maskUnits="userSpaceOnUse"
                        x="371"
                        y="354"
                        width="47"
                        height="26"
                      >
                        <g id="446d9a5bc5">
                          <path
                            id="Vector_5"
                            d="M371.939 354.235H417.828V379.861H371.939V354.235Z"
                            fill="white"
                          />
                        </g>
                      </mask>
                      <g mask="url(#mask1_538_178)">
                        <g id="Group_3">
                          <g id="Clip path group_3">
                            <mask
                              id="mask2_538_178"
                              style={{ maskType: "luminance" }}
                              maskUnits="userSpaceOnUse"
                              x="371"
                              y="343"
                              width="48"
                              height="48"
                            >
                              <g id="364cca83b9">
                                <path
                                  id="Vector_6"
                                  d="M395.112 343.85L418.289 367.013L394.942 390.375L371.765 367.209L395.112 343.85Z"
                                  fill="white"
                                />
                              </g>
                            </mask>
                            <g mask="url(#mask2_538_178)">
                              <g id="Group_4">
                                <g id="Clip path group_4">
                                  <mask
                                    id="mask3_538_178"
                                    style={{ maskType: "luminance" }}
                                    maskUnits="userSpaceOnUse"
                                    x="372"
                                    y="354"
                                    width="46"
                                    height="26"
                                  >
                                    <g id="948ba688c6">
                                      <path
                                        id="Vector_7"
                                        d="M407.001 355.732L417.2 365.924C417.542 366.268 417.689 366.764 417.584 367.239C417.479 367.716 417.137 368.105 416.681 368.271L386.675 379.247C385.395 379.715 383.959 379.398 382.995 378.434L372.798 368.243C372.454 367.898 372.31 367.402 372.414 366.927C372.519 366.45 372.859 366.061 373.315 365.896L403.323 354.92C404.601 354.452 406.037 354.768 407.001 355.732Z"
                                        fill="white"
                                      />
                                    </g>
                                  </mask>
                                  <g mask="url(#mask3_538_178)">
                                    <g id="Group_5">
                                      <g id="Group_6">
                                        <g id="Clip path group_5">
                                          <mask
                                            id="mask4_538_178"
                                            style={{ maskType: "luminance" }}
                                            maskUnits="userSpaceOnUse"
                                            x="371"
                                            y="354"
                                            width="47"
                                            height="26"
                                          >
                                            <g id="873ce8e414">
                                              <path
                                                id="Vector_8"
                                                d="M417.828 354.235H371.939V379.861H417.828V354.235Z"
                                                fill="white"
                                              />
                                            </g>
                                          </mask>
                                          <g mask="url(#mask4_538_178)">
                                            <g id="Group_7">
                                              <g id="Clip path group_6">
                                                <mask
                                                  id="mask5_538_178"
                                                  style={{
                                                    maskType: "luminance",
                                                  }}
                                                  maskUnits="userSpaceOnUse"
                                                  x="372"
                                                  y="354"
                                                  width="46"
                                                  height="26"
                                                >
                                                  <g id="2895d2005a">
                                                    <path
                                                      id="Vector_9"
                                                      d="M372.298 354.449H417.782V379.766H372.298V354.449Z"
                                                      fill="white"
                                                    />
                                                  </g>
                                                </mask>
                                                <g mask="url(#mask5_538_178)">
                                                  <g id="Group_8">
                                                    <g id="Clip path group_7">
                                                      <mask
                                                        id="mask6_538_178"
                                                        style={{
                                                          maskType: "luminance",
                                                        }}
                                                        maskUnits="userSpaceOnUse"
                                                        x="371"
                                                        y="343"
                                                        width="48"
                                                        height="48"
                                                      >
                                                        <g id="ba4c93c979">
                                                          <path
                                                            id="Vector_10"
                                                            d="M395.112 343.85L418.289 367.013L394.942 390.375L371.765 367.209L395.112 343.85Z"
                                                            fill="white"
                                                          />
                                                        </g>
                                                      </mask>
                                                      <g mask="url(#mask6_538_178)">
                                                        <g id="Group_9">
                                                          <g id="Clip path group_8">
                                                            <mask
                                                              id="mask7_538_178"
                                                              style={{
                                                                maskType:
                                                                  "luminance",
                                                              }}
                                                              maskUnits="userSpaceOnUse"
                                                              x="372"
                                                              y="354"
                                                              width="46"
                                                              height="26"
                                                            >
                                                              <g id="494edbbac6">
                                                                <path
                                                                  id="Vector_11"
                                                                  d="M407.001 355.732L417.2 365.924C417.542 366.268 417.689 366.764 417.584 367.239C417.479 367.716 417.137 368.105 416.681 368.271L386.675 379.247C385.395 379.715 383.959 379.398 382.995 378.434L372.798 368.243C372.454 367.898 372.31 367.402 372.414 366.927C372.519 366.45 372.859 366.061 373.315 365.896L403.323 354.92C404.601 354.452 406.037 354.768 407.001 355.732Z"
                                                                  fill="white"
                                                                />
                                                              </g>
                                                            </mask>
                                                            <g mask="url(#mask7_538_178)">
                                                              <g id="Group_10">
                                                                <path
                                                                  id="Vector_12"
                                                                  d="M394.565 343.303L418.746 367.47L395.398 390.831L371.218 366.662L394.565 343.303Z"
                                                                  fill="#043284"
                                                                />
                                                              </g>
                                                            </g>
                                                          </g>
                                                        </g>
                                                      </g>
                                                    </g>
                                                  </g>
                                                </g>
                                              </g>
                                            </g>
                                          </g>
                                        </g>
                                      </g>
                                    </g>
                                  </g>
                                </g>
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
                    <g id="Clip path group_9">
                      <mask
                        id="mask8_538_178"
                        style={{ maskType: "luminance" }}
                        maskUnits="userSpaceOnUse"
                        x="367"
                        y="376"
                        width="47"
                        height="27"
                      >
                        <g id="32565876ae">
                          <path
                            id="Vector_13"
                            d="M367.172 376.882H413.061V402.508H367.172V376.882Z"
                            fill="white"
                          />
                        </g>
                      </mask>
                      <g mask="url(#mask8_538_178)">
                        <g id="Group_11">
                          <g id="Clip path group_10">
                            <mask
                              id="mask9_538_178"
                              style={{ maskType: "luminance" }}
                              maskUnits="userSpaceOnUse"
                              x="366"
                              y="366"
                              width="48"
                              height="47"
                            >
                              <g id="ec93f2da2d">
                                <path
                                  id="Vector_14"
                                  d="M390.114 366.427L413.291 389.59L389.944 412.951L366.767 389.788L390.114 366.427Z"
                                  fill="white"
                                />
                              </g>
                            </mask>
                            <g mask="url(#mask9_538_178)">
                              <g id="Group_12">
                                <g id="Clip path group_11">
                                  <mask
                                    id="mask10_538_178"
                                    style={{ maskType: "luminance" }}
                                    maskUnits="userSpaceOnUse"
                                    x="367"
                                    y="377"
                                    width="46"
                                    height="26"
                                  >
                                    <g id="0aed3741d7">
                                      <path
                                        id="Vector_15"
                                        d="M402.003 378.309L412.202 388.501C412.546 388.845 412.69 389.341 412.586 389.818C412.481 390.293 412.139 390.682 411.682 390.85L381.677 401.824C380.397 402.291 378.96 401.975 377.997 401.011L367.8 390.819C367.456 390.475 367.311 389.979 367.416 389.504C367.521 389.029 367.861 388.64 368.317 388.473L398.325 377.499C399.603 377.028 401.039 377.347 402.003 378.309Z"
                                        fill="white"
                                      />
                                    </g>
                                  </mask>
                                  <g mask="url(#mask10_538_178)">
                                    <g id="Group_13">
                                      <g id="Group_14">
                                        <g id="Clip path group_12">
                                          <mask
                                            id="mask11_538_178"
                                            style={{ maskType: "luminance" }}
                                            maskUnits="userSpaceOnUse"
                                            x="367"
                                            y="376"
                                            width="47"
                                            height="27"
                                          >
                                            <g id="037cef5137">
                                              <path
                                                id="Vector_16"
                                                d="M413.061 376.882H367.172V402.508H413.061V376.882Z"
                                                fill="white"
                                              />
                                            </g>
                                          </mask>
                                          <g mask="url(#mask11_538_178)">
                                            <g id="Group_15">
                                              <g id="Clip path group_13">
                                                <mask
                                                  id="mask12_538_178"
                                                  style={{
                                                    maskType: "luminance",
                                                  }}
                                                  maskUnits="userSpaceOnUse"
                                                  x="367"
                                                  y="376"
                                                  width="46"
                                                  height="27"
                                                >
                                                  <g id="4d4eccfd97">
                                                    <path
                                                      id="Vector_17"
                                                      d="M367.291 376.905H412.774V402.366H367.291V376.905Z"
                                                      fill="white"
                                                    />
                                                  </g>
                                                </mask>
                                                <g mask="url(#mask12_538_178)">
                                                  <g id="Group_16">
                                                    <g id="Clip path group_14">
                                                      <mask
                                                        id="mask13_538_178"
                                                        style={{
                                                          maskType: "luminance",
                                                        }}
                                                        maskUnits="userSpaceOnUse"
                                                        x="366"
                                                        y="366"
                                                        width="48"
                                                        height="47"
                                                      >
                                                        <g id="67352989c9">
                                                          <path
                                                            id="Vector_18"
                                                            d="M390.114 366.427L413.291 389.59L389.944 412.951L366.767 389.788L390.114 366.427Z"
                                                            fill="white"
                                                          />
                                                        </g>
                                                      </mask>
                                                      <g mask="url(#mask13_538_178)">
                                                        <g id="Group_17">
                                                          <g id="Clip path group_15">
                                                            <mask
                                                              id="mask14_538_178"
                                                              style={{
                                                                maskType:
                                                                  "luminance",
                                                              }}
                                                              maskUnits="userSpaceOnUse"
                                                              x="367"
                                                              y="377"
                                                              width="46"
                                                              height="26"
                                                            >
                                                              <g id="f8c1af682a">
                                                                <path
                                                                  id="Vector_19"
                                                                  d="M402.003 378.309L412.202 388.501C412.546 388.845 412.69 389.341 412.586 389.818C412.481 390.293 412.139 390.682 411.682 390.85L381.677 401.824C380.397 402.291 378.96 401.975 377.997 401.011L367.8 390.819C367.456 390.475 367.311 389.979 367.416 389.504C367.521 389.029 367.861 388.64 368.317 388.473L398.325 377.499C399.603 377.028 401.039 377.347 402.003 378.309Z"
                                                                  fill="white"
                                                                />
                                                              </g>
                                                            </mask>
                                                            <g mask="url(#mask14_538_178)">
                                                              <g id="Group_18">
                                                                <path
                                                                  id="Vector_20"
                                                                  d="M389.567 365.88L413.747 390.046L390.4 413.407L366.219 389.238L389.567 365.88Z"
                                                                  fill="#095D40"
                                                                />
                                                              </g>
                                                            </g>
                                                          </g>
                                                        </g>
                                                      </g>
                                                    </g>
                                                  </g>
                                                </g>
                                              </g>
                                            </g>
                                          </g>
                                        </g>
                                      </g>
                                    </g>
                                  </g>
                                </g>
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
        <g id="Frame_4">
          <path
            id="Vector_21"
            d="M401.667 69.7831V63.8658C401.667 61.3904 402.65 59.0165 404.4 57.2661C406.151 55.5158 408.525 54.5325 411 54.5325H414.5C414.809 54.5325 415.106 54.6554 415.325 54.8742C415.544 55.093 415.667 55.3897 415.667 55.6991V59.1991C415.667 61.6745 414.683 64.0485 412.933 65.7988C411.183 67.5491 408.809 68.5325 406.333 68.5325C403.858 68.5325 401.484 69.5158 399.734 71.2661C397.983 73.0165 397 75.3904 397 77.8658C397 82.5325 399.333 84.8658 399.333 89.5325C399.333 92.0568 398.515 94.513 397 96.5325"
            stroke="#4F9CF9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            id="Vector_22"
            d="M378.333 68.5326C380.067 67.2326 382.128 66.4409 384.286 66.2464C386.443 66.0518 388.613 66.462 390.551 67.4309C392.489 68.3999 394.118 69.8893 395.258 71.7324C396.397 73.5754 397 75.6993 397 77.8659C395.267 79.1659 393.206 79.9575 391.048 80.1521C388.89 80.3467 386.72 79.9365 384.782 78.9675C382.845 77.9986 381.215 76.5091 380.076 74.6661C378.937 72.823 378.333 70.6992 378.333 68.5326Z"
            stroke="#4F9CF9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            id="Vector_23"
            d="M380.667 96.5325H413.333"
            stroke="#4F9CF9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <g id="Frame_5">
          <path
            id="Vector_24"
            d="M178.875 115.407V152.074C178.875 153.29 179.358 154.456 180.217 155.315C181.077 156.175 182.243 156.657 183.458 156.657H220.125"
            stroke="#4F9CF9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            id="Vector_25"
            d="M188.042 145.199C189.188 140.616 191.479 129.157 197.208 129.157C201.792 129.157 201.792 136.032 206.375 136.032C212.104 136.032 216.688 124.574 217.833 119.991"
            stroke="#4F9CF9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </motion.svg>
  );
};

export default PillarsVisual;
