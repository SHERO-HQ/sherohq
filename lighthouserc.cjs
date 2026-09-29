// Speed and quality budgets, checked by Lighthouse's mobile run (a mid-range
// phone on a throttled 4G connection). PRD target: under 3 seconds on 4G.
// Run with `yarn test:speed` after `yarn build`.
module.exports = {
  ci: {
    collect: {
      startServerCommand: "yarn start -p 3100",
      startServerReadyPattern: "Ready",
      url: [
        "http://localhost:3100/",
        "http://localhost:3100/services",
        "http://localhost:3100/support/consultation",
        "http://localhost:3100/merchander",
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox --headless=new",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 1 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 3000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci" },
  },
};
