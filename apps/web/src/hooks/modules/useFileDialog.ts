import { computed, ref } from 'vue' // 修复：补充 computed 导入（原代码漏导会报错）

/**
 * 读取文件并返回数据（组合式函数）
 * @param options - 配置项（可选）
 * @param options.accept - 允许的文件类型，默认空字符串
 * @param options.maxSize - 最大文件大小（默认10MB）
 * @param options.multiple - 是否支持多文件（默认true）
 * @param options.type - 允许的文件MIME类型数组，默认空数组
 * @param options.maxCount - 最大选择文件数，默认3个
 * @returns { click: () => Promise<any[]>,  remove: () => void, fileList: Ref<any[]>, successList: ComputedRef<any[]>, errorList: ComputedRef<any[]> }
 */
type Options = {
  accept?: string
  maxSize?: number
  multiple?: boolean
  type?: string[]
  maxCount?: number
  duplicate?: boolean
}

interface FileItem {
  code: 200 | 400
  msg?: string
  file?: File
}

export function useFileDialog(options: Options = {}) {
  const {
    accept = '',
    maxSize = 10 * 1024 * 1024,
    multiple = true,
    type = [],
    maxCount = 1,
    duplicate = false,
  } = options

  // 最大文件大小（MB）
  const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0)

  let fileInput: any
  // 文件列表
  const fileList = ref<FileItem[]>([])
  // 成功列表
  const successList: any = computed(() => fileList.value.filter((item) => item.code === 200))
  // 失败列表
  const errorList = computed<FileItem[]>(() => fileList.value.filter((item) => item.code === 400))

  const handleFileChange = (
    files: FileList,
    resolve: (value: FileItem[]) => void,
    reject: (reason: Error | string) => void,
  ) => {
    if (!files.length) {
      reject('未选择任何文件')
      return
    }

    for (const file of files) {
      // 文件数校验
      if (successList.value.length + 1 > maxCount) {
        fileList.value.push({
          code: 400,
          msg: `文件「${file.name}」超出最大选择数（最多${maxCount}个）`,
        })
        continue
      }
      // 大小校验（保留原有逻辑）
      if (file.size > maxSize) {
        fileList.value.push({
          code: 400,
          msg: `文件 ${file.name} 大小不能超过 ${maxSizeMB} MB`,
        })
        continue
      }
      // 类型校验（保留原有逻辑）
      if (type.length && !type.includes(file.type)) {
        fileList.value.push({
          code: 400,
          msg: `文件 ${file.name} 类型必须为 ${type.join('、')}`,
        })
        continue
      }
      // 重复校验
      if (!duplicate) {
        const isDuplicate = successList.value.some(
          (item: any) => item.file.name === file.name && item.file.size === file.size,
        )
        if (isDuplicate) {
          fileList.value.push({
            code: 400,
            msg: `文件 ${file.name} 已选择`,
          })
          continue
        }
      }
      // 合法文件
      fileList.value.push({ code: 200, file })
    }
    resolve(successList)
  }

  const remove = () => {
    fileList.value = []
    if (!fileInput) return
    fileInput.remove()
    fileInput = null
  }

  const create = () => {
    remove()
    try {
      const newFileInput = document.createElement('input') as HTMLInputElement
      newFileInput.type = 'file'
      newFileInput.multiple = multiple
      newFileInput.accept = accept
      newFileInput.style.display = 'none'
      document.body.appendChild(newFileInput)
      fileInput = newFileInput
    } catch (err) {
      console.error('文件输入框创建失败：', err)
      throw new Error('文件选择功能初始化失败，请刷新页面重试')
    }
  }

  const click = () => {
    return new Promise((resolve, reject) => {
      try {
        if (successList.value.length >= maxCount) {
          ElMessage.error(`最多选择 ${maxCount} 个文件`)
          reject()
          return
        }
        if (!fileInput) create()
        fileInput.value = ''

        fileInput.addEventListener(
          'change',
          (e: any) => {
            handleFileChange(e.target.files, resolve, reject)
          },
          { once: true }, // 保留：自动移除事件监听，避免重复绑定
        )
        fileInput.click()
      } catch (error) {
        reject(error)
      }
    })
  }

  onBeforeUnmount(() => {
    remove()
  })

  return { click, remove, fileList, successList, errorList }
}
