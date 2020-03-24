export type ConsoleLog = typeof console.log

export let replaceConsoleWith = (logReplacement: (name, ...logArg) => void) => {
   let methodList = 'debug info log warn error'.split(' ')

   let save: Record<string, any>

   let method = (name: string): ConsoleLog => (...logArg) => {
      logReplacement(name, ...logArg)
   }

   let replace = () => {
      save = {}
      methodList.forEach((name) => {
         save[name] = console[name]
         console[name] = method(name)
      })
   }

   let restore = () => {
      methodList.forEach((name) => {
         console[name] = save[name]
      })
   }

   return {
      in: <T>(targetCode: () => T) => {
         let result: T
         replace()
         try {
            result = targetCode()
         } finally {
            restore()
         }
         return result
      },
   }
}
