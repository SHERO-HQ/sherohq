const Cookies = () => {
  return (
    <>
      <div className="pt-8 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 rounded p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800 article-content">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Cookie Policy
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Last Updated: January 24, 2026
            </p>

            <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  What Are Cookies?
                </h2>
                <p>
                  Cookies are small text files that are placed on your computer
                  or mobile device when you visit a website. They are widely
                  used to make websites work more efficiently and to provide
                  information to the owners of the site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  How We Use Cookies
                </h2>
                <p className="mb-4">We use cookies for several purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Essential Cookies:</strong> Necessary for the
                    website to function (e.g., shopping cart functionality).
                  </li>
                  <li>
                    <strong>Performance Cookies:</strong> Help us understand how
                    visitors interact with our website by collecting and
                    reporting information anonymously.
                  </li>
                  <li>
                    <strong>Functional Cookies:</strong> Enable the website to
                    provide enhanced functionality and personalization.
                  </li>
                  <li>
                    <strong>Targeting Cookies:</strong> Used to deliver
                    advertisements more relevant to you and your interests.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Managing Cookies
                </h2>
                <p>
                  Most web browsers allow some control of most cookies through
                  the browser settings. To find out more about cookies,
                  including how to see what cookies have been set and how to
                  manage and delete them, visit{" "}
                  <a
                    href="https://www.allaboutcookies.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    www.allaboutcookies.org
                  </a>
                  .
                </p>
                <p className="mt-4">
                  Please note that if you choose to disable cookies, some parts
                  of our website may not function properly.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cookies;
