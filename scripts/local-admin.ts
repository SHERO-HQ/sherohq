// The local-only admin account `yarn db:seed` creates, so the admin can be
// tried and tested without the real account. The seed refuses non-local
// databases, so these never reach a real one.
export const localAdmin = {
  email: "admin@shero.local",
  password: "local admin password",
  // A fixed two-factor secret; the accessibility checks compute codes from it.
  totpSecret: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP",
};
