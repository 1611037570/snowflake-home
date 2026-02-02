import { getAllComponent } from '@/components'

const { components } = getAllComponent()
const getComponent = (name: string) => {
  if (!name) return
  if (!components[name]) return
  return components[name]?.component
}
export { getComponent }
