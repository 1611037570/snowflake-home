import { getAllBusinessComponent } from '@/components'

const { components } = getAllBusinessComponent()
const getComponent = (name: string) => {
  if (!name) return
  if (!components[name]) return
  return components[name]?.component
}
export { getComponent }
