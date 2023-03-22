export const getHighlightBlue = (isLight) => {
  if (isLight) {
    return '#0747A6'
  } else {
    return '#4C9AFF'
  }
}

/* (Color ID to Color Name) 1: Lavender, 2: Sage,... */
export const GoogleEventColours = [
  { name: 'Lavender', hex: '#7986cb' },
  { name: 'Sage', hex: '#33b679' },
  { name: 'Grape', hex: '#8e24aa' },
  { name: 'Flamingo', hex: '#e67c73' },
  { name: 'Banana', hex: '#f6c026' },
  { name: 'Tangerine', hex: '#f5511d' },
  { name: 'Peacock', hex: '#039be5' },
  { name: 'Graphite', hex: '#616161' },
  { name: 'Blueberry', hex: '#3f51b5' },
  { name: 'Basil', hex: '#0b8043' },
  { name: 'Tomato', hex: '#d60000' },
]

export const isValidGoogleEventColorId = (colorId) => {
  return colorId >= 1 && colorId <= 11
}
