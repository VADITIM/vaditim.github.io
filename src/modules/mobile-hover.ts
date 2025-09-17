import { reactive } from "vue"

const states = reactive<Record<string, boolean>>({})

export function toggle(name: string) {
  const currentlyOpen = !!states[name]

  Object.keys(states).forEach(key => {
    states[key] = false
  })

  if (!currentlyOpen) {
    states[name] = true
  }
}

export function isOpen(skillName: string): boolean {
  return states[skillName] || false
}

export function closeAll() {
  Object.keys(states).forEach(key => {
    states[key] = false
  })
}

