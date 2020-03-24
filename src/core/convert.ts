import plist from 'plist'
import { Beeftext } from './beeftext'
import { Snippet, snippetIdInfo } from './snippet'
import { Group } from './group'
import { ConsoleLog, replaceConsoleWith } from '../util/replaceConsoleWith'
import { dateToString } from '../util/dateToString'

const undefinedGroup = `{_}`

/**
 * The entry point of this file
 *
 * It converts the given XML to BeefText JSON, and signals any warning or error
 * encountered along the way
 */
export let convert = (
   xml: string,
   now: string,
   uuid: string,
   consoleError: ConsoleLog,
) => {
   let result = {
      json: '',
      warning: '',
      error: '',
   }

   if (xml === '') {
      return result
   }

   let errorList: string[] = []
   let warningList: string[] = []

   let addWarning = (...messageList) => {
      warningList.push(messageList.join(' '))
   }

   let structureIn: any
   try {
      replaceConsoleWith((method, message) => {
         errorList.push(`${method} ${message}`)
      }).in(() => {
         structureIn = plist.parse(xml)
      })
   } catch (e) {
      consoleError(e)
      result.error = `\
>>>>>>>>>>>>>>>>>>>>>> ERROR <<<<<<<<<<<<<<<<<<<<<<
Failed to parse Property List XML
${errorList.join('\n')}
~ ${e}
---------------------------------------------------`
      return result
   }

   try {
      var output = convertStructure(structureIn, now, addWarning)
   } catch (e) {
      consoleError(e)
      result.error = `\
>>>>>>>>>>>>>>>>>>>>>> ERROR <<<<<<<<<<<<<<<<<<<<<<
Failed to convert TextExpander content to Beeftext
~ ${e}
---------------------------------------------------`
      return result
   }

   try {
      warnMissingGroups(output, addWarning)
   } catch (e) {
      consoleError(e)
   }

   try {
      fixMissingGroups(output, now, uuid)
   } catch (e) {
      consoleError(e)
      warningList.unshift(`\
>>>>>>>>>>>>>>>>>>>>>> WARNING <<<<<<<<<<<<<<<<<<<<<<
Failed to fix the snippets that don't have any groups
Their UUIDs are now probably invalid
~ ${e}
-----------------------------------------------------`)
   }

   result.json = JSON.stringify(output, null, 2)

   result.warning = warningList.join('\n')

   return result
}

/**
 * Check the outputed beeftext, and signal abbreviations without a group
 */
export let warnMissingGroups = (
   beeftext: Beeftext,
   addWarning: (text: string) => void,
): void => {
   beeftext.combos.forEach((combo) => {
      if (combo.group === undefinedGroup) {
         addWarning(
            `snippet ${snippetIdInfo(
               combo,
            )} has no group and will be added to the first group`,
         )
      }
   })
}

/**
 * Given a Beeftext JSON content, it replaces uuid group links in snippets whose
 * uuid is `undefinedGroup`
 *
 * @param beeftext the beeftext structure to check
 * @param now the current time to use to
 * @param uuid
 */
export let fixMissingGroups = (
   beeftext: Beeftext,
   now: string,
   uuid: string,
): void => {
   let firstGroup: Group

   if (beeftext.groups.length > 0) {
      firstGroup = beeftext.groups[0]
   } else {
      firstGroup = {
         creationDateTime: now,
         modificationDateTime: now,
         description: '',
         name: `Group-${now.slice(0, 16)}`,
         uuid,
      }

      beeftext.groups.push(firstGroup)
   }

   beeftext.combos.forEach((combo) => {
      if (combo.group === undefinedGroup) {
         combo.group = firstGroup.uuid
      }
   })
}

/**
 * convertStructure
 *
 * This is where the actual conversion from TextExpansion XML to BeefText
 * happens
 *
 * @param structureIn The parsed TextExpander data
 * @param now The datetime string to use when no relevant data is available for
 * a date field
 */
export let convertStructure = (
   structureIn: any,
   now: string,
   addWarning: (text: string) => void,
) => {
   let snippetMap: Record<string, Snippet> = {}

   let snippetList: Snippet[] = []

   structureIn.snippetsTE2.forEach((snippet) => {
      let snippetOut: Snippet = {
         creationDateTime: dateToString(snippet.creationDate),
         modificationDateTime: dateToString(snippet.modificationDate),
         name: snippet.label,
         keyword: snippet.abbreviation,
         snippet: snippet.plainText,
         enabled: true,
         useLooseMatch: false,
         useHtml: false,
         uuid: `{${snippet.uuidString.toLowerCase()}}`,
         group: undefinedGroup,
      }

      snippetList.push(snippetOut)

      snippetMap[snippet.uuidString] = snippetOut
   })

   let groupCount: Record<string, number> = {}

   let groupList: Group[] = []

   structureIn.groupsTE2.forEach((group) => {
      let groupUuid = `{${group.uuidString.toLowerCase()}}`

      let remainingUuuidList = group.snippetUUIDs.filter((snippetUuid) => {
         if (snippetMap[snippetUuid] !== undefined) {
            snippetMap[snippetUuid].group = groupUuid
            return true
         } else {
            addWarning(
               `group ${group.name} contains snippet with uuid ${snippetUuid}, but no such snippet was found`,
            )
            return false
         }
      })

      if (remainingUuuidList.length === 0) {
         addWarning(
            `removing group ${group.name} since it doesn't contain any snippet`,
         )
      } else {
         groupList.push({
            creationDateTime: now,
            modificationDateTime: now,
            description: '',
            name: group.name,
            uuid: groupUuid,
         })
      }
   })

   let out: Beeftext = {
      fileFormatVersion: 7,
      combos: snippetList,
      groups: groupList,
   }

   return out
}
