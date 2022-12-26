const generateUUID = (ids, numCalled) => {
  if (numCalled === 100) throw new Error('Too many calls to getUUID')
  const uuid = Math.random().toString(36).substring(2, 15)
  if (ids.includes(uuid)) {
    return generateUUID(ids, numCalled + 1)
  }
  return uuid
}

export const getUUID = (ids) => {
  try {
    return generateUUID(ids, 0)
  } catch (error) {
    console.error(error)
  }
}
