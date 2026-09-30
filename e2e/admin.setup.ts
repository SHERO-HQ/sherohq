import { test as setup } from "@playwright/test";
import { localAdmin } from "../scripts/local-admin";
import { codeForStep, stepAt } from "../src/lib/admin/totp";

import { adminState } from "./pages";

// Signs in to the admin once with the local account from `yarn db:seed`, and
// saves the session for the admin checks. (A two-factor code works once, so
// each test can't sign in on its own.)
setup("sign in to the admin", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(localAdmin.email);
  await page.getByLabel("Password").fill(localAdmin.password);
  await page.getByLabel("Code from your authenticator app").fill(codeForStep(localAdmin.totpSecret, stepAt(Date.now())));
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin/listings");
  await page.context().storageState({ path: adminState });
});
