// returns true if the array contains any of the items in the subarray
export const includesAny = (arr, subarr) => {
  return subarr.some((item) => arr.includes(item))
}
