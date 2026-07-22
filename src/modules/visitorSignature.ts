/**
 * A readable scrap of the visitor's device identity, taken from the same signals
 * the comment fingerprint hashes. Unlike the fingerprint it is never sent
 * anywhere — the classified dossier prints it straight back at the visitor, so
 * they find their own machine named in a file that claims to be about them.
 */

const UNREADABLE_RENDERERS = ['no-webgl', 'masked', 'webgl-error']

export const visitorSignature = readVisitorSignature()

export function getWebglRenderer(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    if (!gl) return 'no-webgl'
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    return debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : 'masked'
  } catch {
    return 'webgl-error'
  }
}

function readVisitorSignature(): string {
  const gpu = describeGpu(getWebglRenderer())
  if (gpu) return gpu
  // The GPU is masked or blocked; screen and core count are still specific
  // enough that the visitor recognises the machine as theirs.
  return `${screen.width}x${screen.height} · ${navigator.hardwareConcurrency} CORES`
}

function describeGpu(renderer: string): string | null {
  if (UNREADABLE_RENDERERS.includes(renderer)) return null
  // Chrome wraps the GPU in ANGLE's "vendor, renderer, backend" triple and tacks
  // a shader-model suffix onto the renderer; only the model name reads as a name.
  const angleFields = renderer.startsWith('ANGLE (') ? renderer.slice('ANGLE ('.length, -1).split(', ') : null
  return (angleFields?.[1] ?? renderer).replace(/ Direct3D.*$/, '').toUpperCase()
}
