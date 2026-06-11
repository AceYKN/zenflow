import { readFileSync } from 'node:fs'

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const toastStart = appSource.indexOf('<div className={`break-toast ${breakSettings.intensity}`}')
const toastEnd = appSource.indexOf('<BottomStatus />', toastStart)

if (toastStart === -1 || toastEnd === -1) {
  throw new Error('Could not find the break toast markup in src/App.tsx')
}

const toastMarkup = appSource.slice(toastStart, toastEnd)
const forbiddenFragments = ['breakNotice', 'recallSeconds', '无需操作', '<p>']

for (const fragment of forbiddenFragments) {
  if (toastMarkup.includes(fragment)) {
    throw new Error(`Break cue toast should not render prompt text or instructions: found "${fragment}"`)
  }
}
