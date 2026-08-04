#!/usr/bin/env node

import { exec } from 'child_process'
import readline from 'readline'

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true, // 启用终端功能，支持方向键
})

// 命令列表
const commands = [
  { name: '运行开发服务器', command: 'pnpm dev' },
  { name: '运行测试', command: 'pnpm test:unit' },
  { name: '构建项目', command: 'pnpm build-only' },
]

// 当前选中的命令索引
let selectedIndex = 0

// 显示菜单
function showMenu() {
  console.clear()
  console.log('=== 雪花起始页命令菜单 ===\n')

  commands.forEach((cmd, index) => {
    const prefix = index === selectedIndex ? '\x1b[32m❯\x1b[0m ' : '  '
    console.log(`${prefix}${index + 1}. ${cmd.name} (${cmd.command})`)
  })

  console.log('\n使用上下箭头键选择，回车键执行，Ctrl+C退出')
}

// 执行命令
function executeCommand(command) {
  console.log(`\n执行命令: ${command}\n`)
  rl.close()

  const child = exec(command)

  child.stdout.on('data', (data) => {
    process.stdout.write(data)
  })

  child.stderr.on('data', (data) => {
    process.stderr.write(data)
  })

  child.on('close', (code) => {
    console.log(`\n命令执行完毕，退出码: ${code}`)
  })
}

// 处理键盘输入
function handleInput() {
  // 设置终端为原始模式，捕获所有按键
  process.stdin.setRawMode(true)

  process.stdin.on('data', (key) => {
    const keyStr = key.toString('utf8')

    switch (keyStr) {
      case '\u001B[A': // 上箭头
        selectedIndex = (selectedIndex - 1 + commands.length) % commands.length
        showMenu()
        break
      case '\u001B[B': // 下箭头
        selectedIndex = (selectedIndex + 1) % commands.length
        showMenu()
        break
      case '\r': // 回车键
        executeCommand(commands[selectedIndex].command)
        break
      case '\u0003': // Ctrl+C
        console.log('\n\n退出脚本')
        rl.close()
        process.exit(0)
        break
      default:
        // 忽略其他按键
        break
    }
  })
}

// 主流程
function main() {
  showMenu()
  handleInput()
}

// 启动脚本
main()
