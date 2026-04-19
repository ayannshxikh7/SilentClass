export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateAuthFields = ({ name, email, password }, isRegister = false) => {
  const errors = {};

  if (isRegister && (!name || name.length < 2)) {
    errors.name = 'Please enter your full name.';
  }
  if (!emailRegex.test(email || '')) {
    errors.email = 'Enter a valid email address.';
  }
  if (!password || password.length < 6) {
    errors.password = 'Password must contain at least 6 characters.';
  }

  return errors;
};
