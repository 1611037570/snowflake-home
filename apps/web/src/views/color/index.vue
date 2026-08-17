<script setup lang="ts">
import HeroBanner from "./components/HeroBanner.vue";
import BackgroundLayers from "./components/BackgroundLayers.vue";
import PaletteList from "./components/PaletteList.vue";
</script>

<template>
  <SfViewContainer>
    <ElScrollbar>
      <div class="space-y-12 p-6 md:p-8">
        <HeroBanner />
        <div class="my-10 flex items-center gap-6 opacity-60">
          <div
            class="h-px flex-1 bg-gradient-to-r from-transparent via-sf-border to-transparent"
          ></div>
          <span
            class="flex items-center gap-2 text-xs font-semibold tracking-widest text-sf-text-3 uppercase"
          >
            <SfIcon icon="mdi:palette-outline" size="4" />
            Color Palette
          </span>
          <div
            class="h-px flex-1 bg-gradient-to-r from-transparent via-sf-border to-transparent"
          ></div>
        </div>

        <PaletteList />

        <BackgroundLayers />
      </div>
    </ElScrollbar>
  </SfViewContainer>
</template>

<style lang="scss" scoped></style>
