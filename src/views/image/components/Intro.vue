<template>
  <div
    class="mt-4 rounded-lg bg-sf-primary-hover/60 p-3 text-sm transition-colors hover:bg-sf-primary-hover"
  >
    <h4 class="text-sf-basic mb-2 flex items-center gap-1.5 font-semibold">
      <span>{{ $t('image.introTitle') }}</span>
    </h4>
    <ul class="text-sf-secondary space-y-1.5 pl-1">
      <li class="hover:text-sf-basic transition-colors">{{ $t('image.introBullet1') }}</li>
      <li class="hover:text-sf-basic transition-colors">{{ $t('image.introBullet2') }}</li>
    </ul>
  </div>
</template>

<script setup></script>
