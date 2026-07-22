/**
 * Weak identity signals, deliberately hand-rolled — they deter casual double-posting,
 * they do not authenticate anyone. Shared by the guestbook, the rating and the
 * classified unlock so all three agree about who the visitor is.
 */

import { getWebglRenderer } from './visitorSignature'

/**
 * Strict fingerprint: strong enough to recognise the same browser after a cookie
 * wipe, but the GPU string and platform differ between browsers on one machine,
 * so it never carries across them.
 */
export function computeFingerprint(): string {
  const signals = [
    getWebglRenderer(),
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    `${window.devicePixelRatio}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    `${navigator.hardwareConcurrency}`,
    navigator.platform,
  ]
  return hashString(signals.join('||'))
}

/**
 * Browser-independent signals only, so Chrome and Firefox on one machine produce
 * the same hash. Deliberately weak — the server must never match on it alone,
 * only alongside the IP hash.
 */
export function computeCoarseFingerprint(): string {
  const signals = [
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    `${window.devicePixelRatio}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    `${navigator.hardwareConcurrency}`,
  ]
  return hashString(signals.join('||'))
}

function hashString(input: string): string {
  let hashA = 0x811c9dc5
  let hashB = 0x1000193
  for (let index = 0; index < input.length; index++) {
    const code = input.charCodeAt(index)
    hashA = Math.imul(hashA ^ code, 0x01000193)
    hashB = Math.imul(hashB + code, 0x85ebca6b) ^ (hashB >>> 13)
  }
  return (hashA >>> 0).toString(16).padStart(8, '0') + (hashB >>> 0).toString(16).padStart(8, '0')
}
