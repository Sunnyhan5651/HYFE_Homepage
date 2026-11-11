export type SignupInput = {
  name: string;
  loginId: string;
  password: string;
  passwordConfirm: string;
};

export function validateSignup(input: SignupInput): string[] {
  const errors: string[] = [];
  if (input.name.trim().length < 2 || input.name.trim().length > 20) errors.push("name must be 2-20 chars");
  if (!/^[a-zA-Z0-9_]{4,32}$/.test(input.loginId)) errors.push("loginId must be 4-32 chars of letters, numbers, underscore");
  if (input.password.length < 8) errors.push("password must be at least 8 chars");
  if (input.password !== input.passwordConfirm) errors.push("password confirmation does not match");
  return errors;
}
