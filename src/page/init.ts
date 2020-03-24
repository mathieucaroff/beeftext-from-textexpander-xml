import { h } from './lib/hyper'

let makeTextareaSection = () => {
   let core = h('textarea', { className: 'textareaSectionCore' })
   let root = h('div', {}, [core])

   return {
      core,
      root,
   }
}

let makeDivSection = (prop: any = {}) => {
   let { className = '' } = prop
   className += ' divSectionCore'
   let core = h('div', { className })
   let root = h('div', {}, [core])

   return {
      core,
      root,
   }
}

export let makeSpanLine = () => {
   let core = h('span')
   return {
      core,
      root: core,
   }
}

export let init = () => {
   let inputArea = makeTextareaSection()
   let warningArea = makeDivSection({ className: 'warn' })
   let errorArea = makeDivSection({ className: 'error' })
   let titleLine = makeSpanLine()
   let outputArea = makeTextareaSection()

   let pageDiv = h('div', {}, [
      h('h1', {
         textContent: document.title,
      }),
      inputArea.root,
      errorArea.root,
      warningArea.root,
      titleLine.root,
      outputArea.root,
   ])

   document.body.appendChild(pageDiv)

   return { outputArea, errorArea, warningArea, titleLine, inputArea }
}
