import { defineAsyncComponent } from 'vue'

const components: any = import.meta.glob('./*', { eager: false })

const getComponent = (name: string) => {
  if (!name) return

  for (const key in components) {
    const currentName = key.slice(2, -4).toLocaleLowerCase()
    if (currentName !== name) continue
    console.log('components[key]', components[key])

    return defineAsyncComponent(components[key])
  }
}
export { getComponent }
