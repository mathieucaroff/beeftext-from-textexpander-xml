export let uuidv4 = () => {
   let data = crypto.getRandomValues(new Uint8Array(36))
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char, k) => {
      let r = data[k] % 16

      if (char === 'y') r = 8 + (r % 4)

      return r.toString(16)
   })
}
