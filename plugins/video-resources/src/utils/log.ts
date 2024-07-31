const isBrowser = typeof self !== 'undefined'
const escape = isBrowser ? '\u001b[' : '\x1b['
const icon2server = isBrowser ? '⬆️' : '⬇️'
const icon2client = isBrowser ? '⬇️' : '⬆️'
// Note: These escapes assume you have a NerdFont installed
const icon2bucket = isBrowser ? '🪣' : '\udb85\udc15'
const iconerr = isBrowser ? '❌' : '\uea87'

export type LogOpts = string | { type: string, icon?: string, color?: string }
function mklogtype (defaultIcon: string, defaultColor: string) {
  return (opts: LogOpts, ...msgs: any[]) => {
    const hasOpts = typeof opts !== 'string'
    const icon = hasOpts ? opts.icon ?? defaultIcon : defaultIcon
    const type = hasOpts ? opts.type : opts
    const color = hasOpts ? opts.color ?? defaultColor : defaultColor
    console.log(`${escape}${color}${icon} ${type}${escape}0m`, ...msgs)
  }
}
export const log2server = mklogtype(icon2server, '32m')
export const log2client = mklogtype(icon2client, '35m')
export const log2bucket = mklogtype(icon2bucket, '34m')
export const logerr = mklogtype(iconerr, '31m')
