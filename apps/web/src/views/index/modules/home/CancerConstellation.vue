<template>
  <div class="cancer-constellation">
    <svg width="100%" height="100%" viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 深空背景渐变 -->
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%" fx="40%" fy="40%">
          <stop offset="0%" stop-color="#141f33" />
          <stop offset="60%" stop-color="#0a1128" />
          <stop offset="100%" stop-color="#030712" />
        </radialGradient>

        <!-- 恒星发光渐变 -->
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="20%" stop-color="#ffffff" stop-opacity="0.8" />
          <stop offset="60%" stop-color="#aabbff" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#aabbff" stop-opacity="0" />
        </radialGradient>

        <radialGradient id="brightStarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="15%" stop-color="#ffffff" stop-opacity="0.9" />
          <stop offset="40%" stop-color="#ccddff" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#ccddff" stop-opacity="0" />
        </radialGradient>

        <radialGradient id="m44Glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#88ddff" stop-opacity="0.25" />
          <stop offset="60%" stop-color="#88ddff" stop-opacity="0.05" />
          <stop offset="100%" stop-color="#88ddff" stop-opacity="0" />
        </radialGradient>

        <filter id="galaxyNoise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="42" />
          <feColorMatrix
            type="matrix"
            values="
    0 0 0 0 0.1
    0 0 0 0 0.15
    0 0 0 0 0.3
    0 0 0 0.25 0"
          />
          <feBlend mode="screen" in="SourceGraphic" in2="SourceGraphic" />
        </filter>

        <pattern id="starPattern" width="200" height="200" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="30" r="0.5" fill="#ffffff" opacity="0.6" />
          <circle cx="80" cy="15" r="0.8" fill="#ffffff" opacity="0.4" />
          <circle cx="150" cy="60" r="0.3" fill="#ffffff" opacity="0.8" />
          <circle cx="40" cy="90" r="0.6" fill="#ffffff" opacity="0.5" />
          <circle cx="110" cy="140" r="1.0" fill="#ffffff" opacity="0.3" />
          <circle cx="180" cy="120" r="0.4" fill="#ffffff" opacity="0.7" />
          <circle cx="60" cy="170" r="0.7" fill="#ffffff" opacity="0.4" />
          <circle cx="140" cy="180" r="0.5" fill="#ffffff" opacity="0.6" />
          <circle cx="10" cy="10" r="1.2" fill="#ffffff" opacity="0.2" />
          <circle cx="190" cy="190" r="0.8" fill="#ffffff" opacity="0.3" />
        </pattern>
      </defs>

      <!-- M44 - 蜂巢星团 -->
      <text x="570" y="620" class="dso-label" text-anchor="middle">M44 - 蜂巢星团</text>
      <!-- M67 -->
      <text x="180" y="215" class="dso-label" text-anchor="middle">M67</text>

      <!-- ===== 修正后的连线 ===== -->
      <!-- 身体与腿（保留原样，合理） -->
      <path
        d="M 400,500 L 460,600 L 380,750 L 500,850 L 440,960"
        class="constellation-line-bright"
      />
      <path d="M 380,750 L 300,650 L 400,500" class="constellation-line-bright" />
      <path d="M 300,650 L 200,800 L 240,880" class="constellation-line" />
      <path d="M 300,650 L 240,880" class="constellation-line" />
      <path d="M 460,600 L 500,850 L 540,880" class="constellation-line" />
      <path d="M 500,850 L 440,960" class="constellation-line" />
      <path d="M 380,750 L 540,880" class="constellation-line" />
      <path d="M 460,600 L 600,800" class="constellation-line" />

      <!-- 螯与头 —— 修正为 α-ζ-β 和 ζ-γ-δ -->
      <path d="M 400,500 L 320,400 L 180,240" class="constellation-line-bright" />
      <!-- γ-ζ-α -->
      <path d="M 320,400 L 620,260" class="constellation-line-bright" />
      <!-- ζ-β 新增，替换原γ-β -->
      <!-- 删除原 M 400,500 L 620,260 (γ-β) -->
      <!-- 删除原 α-β 虚线 -->

      <!-- ===== 恒星标记（保持不变） ===== -->

      <!-- 贝塔星 (Tarf) - 右螯 -->
      <circle cx="620" cy="260" r="25" fill="url(#brightStarGlow)" />
      <circle cx="620" cy="260" r="3.5" fill="#ffffff" />
      <path
        d="M 610,260 L 630,260 M 620,250 L 620,270"
        stroke="#ffffff"
        stroke-width="1.5"
        opacity="0.8"
      />
      <text x="635" y="255" class="star-label-bright">贝塔星 (Tarf)</text>

      <!-- 阿尔法星 (Acubens) - 左螯 -->
      <circle cx="180" cy="240" r="22" fill="url(#brightStarGlow)" />
      <circle cx="180" cy="240" r="3.0" fill="#ffffff" />
      <path
        d="M 170,240 L 190,240 M 180,230 L 180,250"
        stroke="#ffffff"
        stroke-width="1.5"
        opacity="0.8"
      />
      <text x="245" y="235" class="star-label-bright" text-anchor="end">阿尔法星 (Acubens)</text>

      <!-- 泽塔星 (Tegmine) - 头 -->
      <circle cx="320" cy="400" r="20" fill="url(#brightStarGlow)" />
      <circle cx="320" cy="400" r="2.5" fill="#ffffff" />
      <text x="320" y="390" class="star-label" text-anchor="middle">泽塔星 (Tegmine)</text>

      <!-- 伽马星 (Asellus Borealis) - 北驴 -->
      <circle cx="400" cy="500" r="22" fill="url(#brightStarGlow)" />
      <circle cx="400" cy="500" r="2.5" fill="#ffffff" />
      <path
        d="M 390,500 L 410,500 M 400,490 L 400,510"
        stroke="#ffffff"
        stroke-width="1"
        opacity="0.8"
      />
      <text x="400" y="490" class="star-label" text-anchor="middle">伽马星 (Asellus Borealis)</text>

      <!-- 德尔塔星 (Asellus Australis) - 南驴 -->
      <circle cx="460" cy="600" r="20" fill="url(#brightStarGlow)" />
      <circle cx="460" cy="600" r="3.0" fill="#ffffff" />
      <path
        d="M 450,600 L 470,600 M 460,590 L 460,610"
        stroke="#ffffff"
        stroke-width="1"
        opacity="0.8"
      />
      <text x="630" y="590" class="star-label" text-anchor="middle">
        德尔塔星 (Asellus Australis)
      </text>

      <!-- 伊塔星 -->
      <circle cx="300" cy="650" r="15" fill="url(#starGlow)" />
      <circle cx="300" cy="650" r="2.0" fill="#ffffff" />
      <text x="285" y="645" class="star-label" text-anchor="end">伊塔星</text>

      <!-- 西塔星 -->
      <circle cx="380" cy="750" r="15" fill="url(#starGlow)" />
      <circle cx="380" cy="750" r="2.0" fill="#ffffff" />
      <text x="380" y="740" class="star-label" text-anchor="middle">西塔星</text>

      <!-- 卡帕星 -->
      <circle cx="500" cy="850" r="14" fill="url(#starGlow)" />
      <circle cx="500" cy="850" r="2.0" fill="#ffffff" />
      <text x="510" y="845" class="star-label">卡帕星</text>

      <!-- 兰布达星 -->
      <circle cx="240" cy="880" r="12" fill="url(#starGlow)" />
      <circle cx="240" cy="880" r="1.5" fill="#ffffff" />
      <text x="225" y="875" class="star-label" text-anchor="end">兰布达星</text>

      <!-- 缪星 -->
      <circle cx="540" cy="880" r="12" fill="url(#starGlow)" />
      <circle cx="540" cy="880" r="1.5" fill="#ffffff" />
      <text x="555" y="900" class="star-label">缪星</text>

      <!-- 纽星 -->
      <circle cx="440" cy="960" r="10" fill="url(#starGlow)" />
      <circle cx="440" cy="960" r="1.0" fill="#ffffff" />
      <text x="440" y="975" class="star-label" text-anchor="middle">纽星</text>

      <!-- 克西星 -->
      <circle cx="200" cy="800" r="12" fill="url(#starGlow)" />
      <circle cx="200" cy="800" r="1.5" fill="#ffffff" />
      <text x="185" y="795" class="star-label" text-anchor="end">克西星</text>

      <!-- 奥密克戎星 -->
      <circle cx="600" cy="800" r="12" fill="url(#starGlow)" />
      <circle cx="600" cy="800" r="1.5" fill="#ffffff" />
      <text x="615" y="795" class="star-label">奥密克戎星</text>

      <!-- 背景环境恒星（增加真实感） -->
      <g fill="#ffffff" opacity="0.6">
        <circle cx="250" cy="150" r="0.8" />
        <circle cx="550" cy="180" r="1.2" opacity="0.3" />
        <circle cx="680" cy="350" r="0.5" />
        <circle cx="150" cy="400" r="1.0" opacity="0.4" />
        <circle cx="700" cy="500" r="0.8" />
        <circle cx="100" cy="600" r="1.5" opacity="0.2" />
        <circle cx="650" cy="650" r="0.5" />
        <circle cx="350" cy="900" r="1.0" />
        <circle cx="150" cy="700" r="0.8" />
        <circle cx="450" cy="150" r="0.5" />
        <circle cx="300" cy="100" r="1.0" opacity="0.3" />
        <circle cx="720" cy="700" r="1.2" opacity="0.4" />
        <circle cx="80" cy="800" r="0.5" />
        <circle cx="580" cy="950" r="0.8" />
        <circle cx="300" cy="850" r="0.5" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.cancer-constellation {
  position: absolute;
  top: 0;
  left: 0;
  width: 800px;
  height: 1000px;
  z-index: 5;
  pointer-events: none;
  transform: translateZ(15px);
  transform-origin: top left;
}

.constellation-line {
  stroke: #4a6a9f;
  stroke-width: 1.5;
  stroke-opacity: 0.6;
  fill: none;
}
.constellation-line-bright {
  stroke: #7a9acf;
  stroke-width: 2;
  stroke-opacity: 0.8;
  fill: none;
}
.star-label {
  fill: #a0b8d8;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 20px;
  letter-spacing: 1px;
}
.star-label-bright {
  fill: #d0e0ff;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1.5px;
}
.dso-label {
  fill: #66ccff;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 20px;
  font-style: italic;
  letter-spacing: 1px;
}
</style>
