export interface Snippet {
   creationDateTime: string
   modificationDateTime: string
   /** label */
   name: string
   /** abbreviation */
   keyword: string
   /** plaintext */
   snippet: string
   uuid: string
   group: string
   enabled: true
   useHtml: false
   useLooseMatch: false
}

let normalize = (text: string, length = 40): string => {
   return JSON.stringify(text.slice(0, length)).replace(/^"|"$/g, '') || '-'
}

export let snippetIdInfo = (snippet: Snippet): string => {
   let n = normalize(snippet.name)
   let k = normalize(snippet.keyword)
   let s = normalize(snippet.snippet)
   let u = normalize(snippet.uuid, 8)
   return `${n} [uuid ${u}] (${k} -> ${s})`
}
