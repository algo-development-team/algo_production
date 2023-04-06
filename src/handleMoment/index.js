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
