import { expect, test } from "@playwright/test";
import { firstSuperuser, firstSuperuserPassword } from "./config.ts";
import { randomEmail, randomPassword } from "./utils/random";
import { logInUser, logOutUser, signUpNewUser } from "./utils/user";

const tabs = ["My profile", "Password", "Appearance"];

// User Information

test("My profile tab is active by default", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("tab", { name: "My profile" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("All tabs are visible", async ({ page }) => {
  await page.goto("/settings");
  for (const tab of tabs) {
    await expect(page.getByRole("tab", { name: tab })).toBeVisible();
  }
});

test.describe("Edit user full name and email successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Edit user name with a valid name", async ({ page }) => {
    const fullName = "Test User";
    const email = randomEmail();
    const updatedName = "Test User 2";
    const password = randomPassword();

    // Sign up a new user
    await signUpNewUser(page, fullName, email, password);

    // Log in the user
    await logInUser(page, email, password);

    await page.goto("/settings");
    await page.getByRole("tab", { name: "My profile" }).click();
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Full name").fill(updatedName);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("User updated successfully")).toBeVisible();
    // Check if the new name is displayed on the page
    await expect(
      page.getByLabel("My profile").getByText(updatedName, { exact: true }),
    ).toBeVisible();
  });

  test("Edit user email with a valid email", async ({ page }) => {
    const fullName = "Test User";
    const email = randomEmail();
    const updatedEmail = randomEmail();
    const password = randomPassword();

    // Sign up a new user
    await signUpNewUser(page, fullName, email, password);

    // Log in the user
    await logInUser(page, email, password);

    await page.goto("/settings");
    await page.getByRole("tab", { name: "My profile" }).click();
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Email").fill(updatedEmail);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("User updated successfully")).toBeVisible();
    await expect(
      page.getByLabel("My profile").getByText(updatedEmail, { exact: true }),
    ).toBeVisible();
  });
});

test.describe("Edit user with invalid data", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Edit user email with an invalid email", async ({ page }) => {
    const fullName = "Test User";
    const email = randomEmail();
    const password = randomPassword();
    const invalidEmail = "";

    // Sign up a new user
    await signUpNewUser(page, fullName, email, password);

    // Log in the user
    await logInUser(page, email, password);

    await page.goto("/settings");
    await page.getByRole("tab", { name: "My profile" }).click();
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Email").fill(invalidEmail);
    await page.locator("body").click();
    await expect(page.getByText("Email is required")).toBeVisible();
  });

  test("Cancel edit action restores original name", async ({ page }) => {
    const fullName = "Test User";
    const email = randomEmail();
    const password = randomPassword();
    const updatedName = "Test User";

    // Sign up a new user
    await signUpNewUser(page, fullName, email, password);

    // Log in the user
    await logInUser(page, email, password);

    await page.goto("/settings");
    await page.getByRole("tab", { name: "My profile" }).click();
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Full name").fill(updatedName);
    await page.getByRole("button", { name: "Cancel" }).first().click();
    await expect(
      page.getByLabel("My profile").getByText(fullName, { exact: true }),
    ).toBeVisible();
  });

  test("Cancel edit action restores original email", async ({ page }) => {
    const fullName = "Test User";
    const email = randomEmail();
    const password = randomPassword();
    const updatedEmail = randomEmail();

    // Sign up a new user
    await signUpNewUser(page, fullName, email, password);

    // Log in the user
    await logInUser(page, email, password);

    await page.goto("/settings");
    await page.getByRole("tab", { name: "My profile" }).click();
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Email").fill(updatedEmail);
    await page.getByRole("button", { name: "Cancel" }).first().click();
    await expect(
      page.getByLabel("My profile").getByText(email, { exact: true }),
    ).toBeVisible();
  });
});

// Change Password

test.describe("Change password successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Update password successfully", async ({ page }) => {
    const fullName = "Test User";
    const email = randomEmail();
    const password = randomPassword();
    const NewPassword = randomPassword();

    // Sign up a new user
    await signUpNewUser(page, fullName, email, password);

    // Log in the user
    await logInUser(page, email, password);

    await page.goto("/settings");
    await page.getByRole("tab", { name: "Password" }).click();
    await page.getByLabel("Current Password").fill(password);
    await page.getByLabel("New Password").fill(NewPassword);
    await page.getByLabel("Confirm Password").fill(NewPassword);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(
      page.getByText("Password updated successfully."),
    ).toBeVisible();

    await logOutUser(page);

    // Check if the user can log in with the new password
    await logInUser(page, email, NewPassword);
  });
});

test.describe("Change password with invalid data", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Update password with weak passwords", async ({ page }) => {
    const fullName = "Test User";
    const email = randomEmail();
    const password = randomPassword();
    const weakPassword = "weak";

    // Sign up a new user
    await signUpNewUser(page, fullName, email, password);

    // Log in the user
    await logInUser(page, email, password);

    await page.goto("/settings");
    await page.getByRole("tab", { name: "Password" }).click();
    await page.getByLabel("Current Password").fill(password);
    await page.getByLabel("New Password").fill(weakPassword);
    await page.getByLabel("Confirm Password").fill(weakPassword);
    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
  });

  test("New password and confirmation password do not match", async ({
    page,
  }) => {
    const fullName = "Test User";
    const email = randomEmail();
    const password = randomPassword();
    const newPassword = randomPassword();
    const confirmPassword = randomPassword();

    // Sign up a new user
    await signUpNewUser(page, fullName, email, password);

    // Log in the user
    await logInUser(page, email, password);

    await page.goto("/settings");
    await page.getByRole("tab", { name: "Password" }).click();
    await page.getByLabel("Current Password").fill(password);
    await page.getByLabel("New Password").fill(newPassword);
    await page.getByLabel("Confirm Password").fill(confirmPassword);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });
});

// Appearance

test("Appearance tab is visible", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("tab", { name: "Appearance" }).click();
  await expect(page.getByLabel("Appearance")).toBeVisible();
});

test("User can switch from light mode to dark mode", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("tab", { name: "Appearance" }).click();
  // await page.getByLabel("Appearance").locator("span").nth(3).click();
  await page.getByLabel("Dark Mode").click();
  const isDarkMode = await page.evaluate(() =>
    document.documentElement.classList.contains("cds--g90"),
  );
  expect(isDarkMode).toBe(true);
});

test("User can switch from dark mode to light mode", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("tab", { name: "Appearance" }).click();
  // await page.getByLabel("Appearance").locator("span").first().click();
  await page.getByLabel("Light Mode").click();
  const isLightMode = await page.evaluate(() =>
    document.documentElement.classList.contains("cds--white"),
  );
  expect(isLightMode).toBe(true);
});

test("Selected mode is preserved across sessions", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("tab", { name: "Appearance" }).click();
  // await page.getByLabel("Appearance").locator("span").nth(3).click();
  await page.getByLabel("Dark Mode").click();

  await logOutUser(page);

  await logInUser(page, firstSuperuser, firstSuperuserPassword);
  const isDarkMode = await page.evaluate(() =>
    document.documentElement.classList.contains("cds--g90"),
  );
  expect(isDarkMode).toBe(true);
});
