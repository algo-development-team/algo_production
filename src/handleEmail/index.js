export const isValidEmail = (email) => {
  // Regular expression for checking email validity
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Return true if the email matches the regex, false otherwise
  return emailRegex.test(email)
}
