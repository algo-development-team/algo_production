/***
 * note:
 * preferences values:
 * -1: no preference
 * 0: urgent
 * 1: deeep
 * 2: shallow
 * rankingPreferences to preferences index:
 * 0: early morning  | (5am-7am)  | (5, 6, 7)
 * 1: morning        | (8am-10am) | (8, 9, 10)
 * 2: noon           | (11am-1pm) | (11, 12, 13)
 * 3: afternoon      | (2pm-4pm)  | (14, 15, 16)
 * 4: late afternoon | (5pm-7pm)  | (17, 18, 19)
 * 5: evening        | (8pm-10pm) | (20, 21, 22)
 * ***/
export const getPreferences = (rankingPreferences) => {
  const preferences = new Array(24).fill(-1)

  for (let i = 0; i < rankingPreferences.length; i++) {
    for (let j = 0; j < 3; j++) {
      const idx = i * 3 + j + 5
      if (rankingPreferences[i] === 0) {
        preferences[idx] = 0
      } else if (rankingPreferences[i] === 1) {
        preferences[idx] = 1
      } else if (rankingPreferences[i] === 2) {
        preferences[idx] = 2
      }
    }
  }

  return preferences
}
