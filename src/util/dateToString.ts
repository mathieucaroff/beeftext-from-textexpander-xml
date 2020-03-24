export let dateToString = (date: Date) => {
   return date.toISOString().replace(/Z$/, '')
}
