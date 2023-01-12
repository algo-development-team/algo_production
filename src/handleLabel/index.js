export const cropLabel = (label, length) => {
  return label.length > length ? label.substring(0, length - 3) + '...' : label
}
