import { convert } from './convert'

import test from 'ava'

const now = '2020-02-20T20:02:20.020'
const uuid = '10000000-1000-4000-8000-100000000000'
const run = (text: string) => convert(text, now, uuid, () => {})

// registerSuite('rewriterLinks', {
test('convert run', (t) => {
   t.notThrows(() => run(''))
})

test('convert allows empty lines', (t) => {
   t.deepEqual(run(''), {
      error: '',
      json: '',
      warning: '',
   })
})

test('convert does convert valid TextExpander XML content', (t) => {
   t.deepEqual(
      run(
         `<?xml version="1.0" encoding="UTF-8"?>
         <!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
         <plist version="1.0">
         <dict>
            <key>groupsTE2</key>
            <array>
               <dict>
                  <key>uuidString</key>
                  <string>9D84DC6F-E207-4E49-A2AA-2BC924821215</string>
                  <key>name</key>
                  <string>WebLinks</string>
                  <key>snippetUUIDs</key>
                  <array>
                     <string>4B6B811A-AC82-4F4F-81F8-D60814222852</string>
                  </array>
               </dict>
            </array>
            <key>snippetsTE2</key>
            <array>
               <dict>
                  <key>label</key>
                  <string>cellexp.now.sh</string>
                  <key>abbreviation</key>
                  <string>cellexp//</string>
                  <key>plainText</key>
                  <string>https://cellexp.now.sh</string>
                  <key>abbreviationMode</key>
                  <integer>2</integer>
                  <key>modificationDate</key>
                  <date>2020-01-13T20:07:31Z</date>
                  <key>creationDate</key>
                  <date>2020-01-13T20:07:16Z</date>
                  <key>uuidString</key>
                  <string>4B6B811A-AC82-4F4F-81F8-D60814222852</string>
               </dict>
            </array>
         </dict>
         </plist>
         `,
      ).json,
      `{
         "fileFormatVersion": 7,
         "combos": [
           {
             "creationDateTime": "2020-01-13T20:07:16.000",
             "modificationDateTime": "2020-01-13T20:07:31.000",
             "name": "cellexp.now.sh",
             "keyword": "cellexp//",
             "snippet": "https://cellexp.now.sh",
             "enabled": true,
             "useLooseMatch": false,
             "useHtml": false,
             "uuid": "{4b6b811a-ac82-4f4f-81f8-d60814222852}",
             "group": "{9d84dc6f-e207-4e49-a2aa-2bc924821215}"
           }
         ],
         "groups": [
           {
             "creationDateTime": "${now}",
             "modificationDateTime": "${now}",
             "description": "",
             "name": "WebLinks",
             "uuid": "{9d84dc6f-e207-4e49-a2aa-2bc924821215}"
           }
         ]
       }`.replace(/\n {7}/g, '\n'),
   )
})

test('convert signals XML error if any is met', (t) => {
   let result = run('_')
   t.truthy(result.error)
   t.assert(result.error.includes('XML'))
})

test('convert signals Property List XML error if any is met', (t) => {
   let result = run('<badRootTag></badRootTag>')
   t.assert(result.error.includes('ERROR'))
   t.assert(result.error.includes('Property List'))
})

test('convert signals TextExpander content error if any', (t) => {
   let result = run('<plist></plist>')
   t.assert(result.error.includes('ERROR'))
   t.assert(result.error.includes('TextExpander content'))
})

test("convert warns if some abbreviations don't have any group", (t) => {
   let result = run(
      `<?xml version="1.0" encoding="UTF-8"?>
         <!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
         <plist version="1.0">
         <dict>
            <key>groupsTE2</key>
            <array>
            </array>
            <key>snippetsTE2</key>
            <array>
               <dict>
                  <key>label</key>
                  <string>cellexp.now.sh</string>
                  <key>abbreviation</key>
                  <string>cellexp//</string>
                  <key>plainText</key>
                  <string>https://cellexp.now.sh</string>
                  <key>abbreviationMode</key>
                  <integer>2</integer>
                  <key>modificationDate</key>
                  <date>2020-01-13T20:07:31Z</date>
                  <key>creationDate</key>
                  <date>2020-01-13T20:07:16Z</date>
                  <key>uuidString</key>
                  <string>4B6B811A-AC82-4F4F-81F8-D60814222852</string>
               </dict>
            </array>
         </dict>
         </plist>
         `,
   )

   t.assert(
      result.json.includes('"name": "cellexp.now.sh"'),
      'convert produces an output with some content',
   )

   t.truthy(result.warning, 'convert issues a warning')
})
