export const stripTags = (html) => {
  const stripped = html.replace(/(<([^>]+)>)/gi, '')
  return stripped
}
