/* For Task colorId */
export const getTaskColorId = (priority) => {
  switch (priority) {
    case 1:
      return 2 // Low: green
    case 2:
      return 7 // Average: turquoise
    case 3:
      return 6 // High: orange
    case 4:
      return 6 // ASAP: orange
    default:
      return 7 // default: turquoise
  }
}
