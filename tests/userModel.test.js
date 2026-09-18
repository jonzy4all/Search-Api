const User = require("../src/models/User");

async function runSaveHooks(user) {
  await User.schema.s.hooks.execPre("save", user, []);
}

describe("User password security", () => {
  test("hashes a new password and compares it securely", async () => {
    const user = new User({
      name: "Kate Jonathan",
      email: "kate@example.com",
      password: "Password123!",
    });

    await runSaveHooks(user);
    expect(user.password).not.toBe("Password123!");
    expect(await user.comparePassword("Password123!")).toBe(true);
    expect(await user.comparePassword("WrongPassword123!")).toBe(false);
  });

  test("records password changes and hides sensitive fields from JSON", async () => {
    const user = new User({
      name: "Administrator",
      email: "admin@example.com",
      password: "OldPassword123!",
      role: "admin",
    });
    user.$isNew = false;
    user.password = "NewPassword456!";
    user.markModified("password");

    await runSaveHooks(user);
    expect(user.passwordChangedAt).toBeInstanceOf(Date);
    expect(user.changedPasswordAfter(1_600_000_000)).toBe(true);
    expect(user.changedPasswordAfter(Math.floor(Date.now() / 1000) + 60)).toBe(false);

    const json = user.toJSON();
    expect(json.password).toBeUndefined();
    expect(json.passwordChangedAt).toBeUndefined();
  });
});
