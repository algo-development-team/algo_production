export const includesAnySubstring = (str, substrs) => {
  return substrs.some((substr) => str.includes(substr))
}
