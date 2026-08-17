<script setup lang="ts">
</script>

<template>
  <div class="sf-color-section group/section">
    <div class="mb-5 flex items-center gap-3">
      <div
        class="h-6 w-1 rounded-full bg-sf-theme transition-all group-hover/section:h-8 group-hover/section:shadow-[0_0_8px_var(--sf-theme)]"
      ></div>
      <h2 class="text-xl font-bold text-sf-text transition-colors">背景层嵌套</h2>
      <span
        class="rounded-full border border-sf-border bg-sf-bg-2 px-2.5 py-0.5 text-xs font-medium text-sf-text-3 shadow-sm transition-colors group-hover/section:bg-sf-theme/5 group-hover/section:text-sf-theme"
      >
        7 层
      </span>
    </div>

    <div class="rounded-xl border border-sf-border overflow-hidden">
      <div class="bg-sf-base p-6 text-sf-primary">
        <div class="mb-2 text-xs font-mono opacity-60">bg-sf-base / --sf-base</div>
        <div class="bg-sf-primary p-6 text-sf-base rounded-lg">
          <div class="mb-2 text-xs font-mono opacity-60">bg-sf-primary / --sf-primary</div>
          <div class="bg-sf-primary-2 p-6 text-sf-base rounded-lg">
            <div class="mb-2 text-xs font-mono opacity-60">bg-sf-primary-2 / --sf-primary-2</div>
            <div class="bg-sf-bg p-6 text-sf-base rounded-lg">
              <div class="mb-2 text-xs font-mono opacity-60">bg-sf-bg / --sf-background</div>
              <div class="bg-sf-bg-2 p-6 text-sf-base rounded-lg">
                <div class="mb-2 text-xs font-mono opacity-60">bg-sf-bg-2 / --sf-background-2</div>
                <div class="bg-sf-bg-3 p-6 text-sf-base rounded-lg">
                  <div class="mb-2 text-xs font-mono opacity-60">bg-sf-bg-3 / --sf-background-3</div>
                  <div class="bg-sf-primary-2 p-6 text-sf-base rounded-lg">
                    <div class="mb-2 text-xs font-mono opacity-60">bg-sf-primary-2 / --sf-primary-2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>