import moment from 'moment'

// helper function
const round = (date, duration, method) => {
  return moment(Math[method](+date / +duration) * +duration)
}

export const roundUp15Min = (date) => {
  return round(date, moment.duration(15, 'minutes'), 'ceil')
}

export const roundDown15Min = (date) => {
  return round(date, moment.duration(15, 'minutes'), 'floor')
}

export const roundClosestValidTimeLength = (duration) => {
  const multiples = [15, 30, 60, 120, 240, 480]
  let nearest = multiples[0]
  for (let i = 1; i < multiples.length; i++) {
    if (Math.abs(multiples[i] - duration) < Math.abs(nearest - duration)) {
      nearest = multiples[i]
    }
  }
  return nearest
}
