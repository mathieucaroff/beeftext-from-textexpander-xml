import { Snippet } from './snippet'
import { Group } from './group'

export interface Beeftext {
   fileFormatVersion: 7
   combos: Snippet[]
   groups: Group[]
}
