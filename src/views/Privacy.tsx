"use client";
import Footer from "@/components/layout/Footer";
import { useTitle } from "@/hooks/useTitle";

const Privacy = () => {
  useTitle("Privacy Policy");

  return (
    <>
      <div className="pt-24 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 rounded p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800 article-content">
            <h1 className="text-3xl md:text-4xl font-sora font-bold text-slate-900 dark:text-white mb-2">
              Privacy Policy
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Last Updated: January 24, 2026
            </p>

            <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  1. Overview
                </h2>
                <p>
                  SHERO Technologies values your privacy. This Privacy Policy
                  explains how we collect, use, disclose, and safeguard your
                  information when you visit our website or use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  2. Information We Collect
                </h2>
                <p className="mb-4">
                  We may collect information about you in a variety of ways:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Personal Data:</strong> Name, shipping address,
                    email address, and telephone number when you register or
                    make a purchase.
                  </li>
                  <li>
                    <strong>Financial Data:</strong> Payment information stored
                    by our payment processors (we do not store full credit card
                    numbers).
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you use
                    our website, such as IP address, browser type, and operating
                    system.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  3. How We Use Your Information
                </h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Process your orders and manage your account.</li>
                  <li>
                    Send you emails regarding your order or account status.
                  </li>
                  <li>Respond to customer service requests.</li>
                  <li>Improve our website and product offerings.</li>
                  <li>Send marketing communications (with your consent).</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  4. Data Security
                </h2>
                <p>
                  We use administrative, technical, and physical security
                  measures to help protect your personal information. While we
                  have taken reasonable steps to secure the personal information
                  you provide to us, please be aware that despite our efforts,
                  no security measures are perfect or impenetrable.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  5. Third-Party Sharing
                </h2>
                <p>
                  We do not sell, trade, or rent your personal identification
                  information to others. We may share generic aggregated
                  demographic information not linked to any personal
                  identification information regarding visitors and users with
                  our business partners and trusted affiliates.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Privacy;
