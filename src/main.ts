import { init } from './page/init'
import { convert } from './core/convert'
import { delayed } from './util/delayed'
import { dateToString } from './util/dateToString'
import { uuidv4 } from './util/uuidv4'

const TITLE_END = 'converted-to-beeftext'

export let main = async () => {
   let { outputArea, errorArea, warningArea, titleLine, inputArea } = init()

   let handleChange = () => {
      let now = dateToString(new Date())
      let uuid = uuidv4()
      let result = convert(inputArea.core.value, now, uuid, console.error)

      outputArea.core.value = result.json
      errorArea.core.innerText = result.error
      warningArea.core.innerText = result.warning

      titleLine.core.innerText = `${now.slice(0, 13)}-${TITLE_END}.btbackup`
   }

   inputArea.core.addEventListener('keydown', handleChange, true)
   inputArea.core.addEventListener('keydown', delayed(handleChange), true)
   inputArea.core.addEventListener('keydown', delayed(handleChange, 5), true)
   inputArea.core.addEventListener('keyup', handleChange, true)
   inputArea.core.addEventListener('change', handleChange, true)

   handleChange()
}
