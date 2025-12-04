const SIZES: any = {
  base: { offset: 3, min: 3 },
  sm: { offset: 2, min: 4 },
  md: { offset: 1, min: 5 },
  lg: { offset: 0, min: 0 },
}

export function $s(size: string | number, type = 'text') {
  const res = Number(size)
  const b = res > 10 ? 3 : 1
  const getSize = (type: string) => Math.max(res - SIZES[type].offset * b, SIZES[type].min)
  const baseSize = getSize('base')
  const smSize = getSize('sm')
  const mdSize = getSize('md')
  const lgSize = getSize('lg')
  return `${type}-${baseSize} md:${type}-${mdSize} sm:${type}-${smSize} lg:${type}-${lgSize}
    `
}
