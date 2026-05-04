<script setup>
import { useResumeStore } from '@/stores'

const resumeStore = useResumeStore()

function handleCreate() {
  resumeStore.addResume()
}
</script>

<template>
  <main class="resume-main">
    <header class="resume-nav">
      <div class="brand">
        <div class="brand-mark"></div>
        <span>直聘简历</span>
      </div>
      <nav class="nav-links">
        <span class="active">首页</span>
        <span>简历模板</span>
        <span>简历分析</span>
        <span>我的简历</span>
        <span>发现</span>
      </nav>
      <div class="nav-actions">
        <button type="button" class="ai-link">AI简历助手</button>
        <button type="button" class="vip-link">开通会员</button>
      </div>
    </header>

    <section class="hero">
      <div class="resume-book">
        <div class="book-page back"></div>
        <div class="book-page front">
          <span>RESUME</span>
        </div>
      </div>

      <div class="envelope">
        <div class="paper paper-left"></div>
        <div class="paper paper-right"></div>
        <div class="message-card">
          <span>MESSAGE</span>
          <SfIcon icon="lucide:check" size="7" />
        </div>
        <div class="mail-body">
          <div class="mail-line"></div>
          <div class="mail-label">BOSS ZHIPIN</div>
        </div>
      </div>

      <div class="hero-content">
        <h1>
          <span>找工作</span>
          <strong>从一份好简历开始</strong>
        </h1>
        <p>打动HR的专业简历，抓住每一个高薪机会</p>
        <div class="hero-actions">
          <button type="button" class="create-btn" @click="handleCreate">立即制作</button>
          <button type="button" class="assistant-btn">
            <span class="tag">体验</span>
            AI简历助手
          </button>
        </div>
      </div>

      <div class="float-actions">
        <button type="button">
          <SfIcon icon="lucide:file-sparkles" size="6" />
        </button>
        <button type="button">
          <SfIcon icon="lucide:badge-help" size="6" />
        </button>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.resume-main {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(circle at 52% 35%, rgba(109, 245, 159, 0.22), transparent 25%),
    linear-gradient(125deg, #174f72 0%, #24387b 48%, #405c82 100%);
}

.resume-main::before {
  position: absolute;
  inset: 0;
  background: rgba(14, 34, 56, 0.28);
  content: '';
}

.resume-nav {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  gap: 44px;
  padding: 0 64px;
  font-weight: 700;
}

.brand,
.nav-links,
.nav-actions {
  display: flex;
  align-items: center;
}

.brand {
  gap: 10px;
  font-size: 18px;
}

.brand-mark {
  width: 32px;
  height: 20px;
  border-radius: 8px 2px 8px 2px;
  background: linear-gradient(135deg, #51f0a6 0%, #23c8d5 55%, #7f5cff 56%, #7f5cff 100%);
}

.nav-links {
  gap: 42px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
}

.nav-links span {
  position: relative;
}

.nav-links .active::after {
  position: absolute;
  right: 3px;
  bottom: -10px;
  left: 3px;
  height: 5px;
  border-radius: 999px;
  background: #9cf45d;
  content: '';
}

.nav-actions {
  gap: 18px;
  margin-left: auto;
}

.ai-link,
.vip-link {
  height: 32px;
  border: 0;
  border-radius: 999px;
  padding: 0 18px;
  font-weight: 800;
}

.ai-link {
  color: #aaf45d;
  border: 2px solid rgba(170, 244, 93, 0.85);
  background: transparent;
}

.vip-link {
  color: #fff;
  background: linear-gradient(90deg, #8149ff, #b852ff);
}

.hero {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: calc(100vh - 64px);
  align-items: center;
  justify-content: center;
  padding: 80px 24px 120px;
}

.hero-content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-content h1 {
  display: flex;
  flex-direction: column;
  gap: 26px;
  margin: 0;
  font-size: clamp(58px, 7vw, 116px);
  line-height: 0.95;
  font-weight: 1000;
  letter-spacing: 0;
}

.hero-content h1 span {
  color: #fff;
  text-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
}

.hero-content h1 strong {
  font-style: normal;
  color: transparent;
  background: linear-gradient(90deg, #ffe8f1 0%, #fff6bb 45%, #dfff76 100%);
  background-clip: text;
  -webkit-background-clip: text;
}

.hero-content p {
  margin: 42px 0 0;
  font-size: 22px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-top: 70px;
}

.create-btn,
.assistant-btn {
  position: relative;
  height: 70px;
  min-width: 170px;
  border: 0;
  border-radius: 999px;
  padding: 0 34px;
  font-size: 22px;
  font-weight: 900;
  cursor: pointer;
}

.create-btn {
  color: #061614;
  background: linear-gradient(90deg, #b6ff5d, #26d8c8);
}

.assistant-btn {
  color: #8eff66;
  background: rgba(13, 40, 30, 0.9);
}

.tag {
  position: absolute;
  top: -18px;
  right: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  border-radius: 999px;
  padding: 0 10px;
  color: #fff;
  background: #ff7a1c;
  font-size: 14px;
}

.resume-book {
  position: absolute;
  left: -48px;
  bottom: -8px;
  z-index: 1;
  width: 360px;
  height: 640px;
  opacity: 0.64;
}

.book-page {
  position: absolute;
  bottom: 0;
  width: 270px;
  height: 590px;
  border-radius: 0 18px 18px 0;
  background: #607b81;
  box-shadow: 20px 20px 40px rgba(0, 0, 0, 0.18);
}

.book-page.back {
  left: 74px;
  transform: translateY(10px);
  background: #6d8588;
}

.book-page.front {
  left: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 120px;
  background: #708488;
}

.book-page.front::after {
  position: absolute;
  right: 0;
  bottom: 144px;
  left: 0;
  height: 72px;
  background: linear-gradient(90deg, #25324c, #00c8b6);
  content: '';
}

.book-page span {
  position: relative;
  z-index: 1;
  font-size: 34px;
  font-weight: 1000;
  letter-spacing: 0;
}

.envelope {
  position: absolute;
  top: 17%;
  left: 50%;
  z-index: 1;
  width: min(760px, 52vw);
  height: min(620px, 46vw);
  transform: translateX(-38%);
  opacity: 0.58;
}

.mail-body {
  position: absolute;
  inset: 120px 24px 0 36px;
  border-radius: 30px 30px 6px 6px;
  background: #bec163;
  transform: rotate(0deg);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.16);
}

.mail-body::before,
.mail-body::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 62%;
  background: rgba(221, 226, 120, 0.72);
  clip-path: polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%);
  content: '';
}

.mail-line {
  position: absolute;
  top: 178px;
  left: 126px;
  width: 250px;
  height: 136px;
  border-radius: 16px;
  background: #00aaa6;
}

.mail-label {
  position: absolute;
  right: -150px;
  bottom: 120px;
  width: 360px;
  transform: rotate(-12deg);
  background: #1988a4;
  padding: 16px 28px;
  font-size: 34px;
  font-weight: 1000;
}

.message-card {
  position: absolute;
  top: 118px;
  left: 300px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 18px;
  width: 350px;
  height: 90px;
  transform: rotate(-5deg);
  border-radius: 18px;
  padding: 0 26px;
  color: #4b5663;
  background: #e6e9ed;
  font-size: 38px;
  font-weight: 1000;
}

.message-card :deep(svg) {
  color: #119ea8;
}

.paper {
  position: absolute;
  z-index: 2;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: #7c78bc;
}

.paper::before,
.paper::after {
  position: absolute;
  left: 32px;
  width: 68px;
  height: 8px;
  border-radius: 999px;
  background: rgba(236, 234, 201, 0.6);
  content: '';
}

.paper::before {
  top: 48px;
}

.paper::after {
  top: 74px;
}

.paper-left {
  top: 98px;
  left: 44px;
  transform: rotate(-30deg);
}

.paper-right {
  top: 190px;
  right: 12px;
  transform: rotate(12deg);
}

.float-actions {
  position: absolute;
  right: 52px;
  bottom: 58px;
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.float-actions button {
  width: 66px;
  height: 66px;
  border: 0;
  border-radius: 50%;
  color: #9df76a;
  background: #075b55;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.2);
}

@media (max-width: 900px) {
  .resume-nav {
    justify-content: space-between;
    padding: 0 20px;
  }

  .nav-links,
  .nav-actions {
    display: none;
  }

  .hero-content h1 {
    font-size: 54px;
  }

  .hero-content p {
    font-size: 17px;
  }

  .hero-actions {
    flex-direction: column;
    gap: 18px;
    margin-top: 44px;
  }

  .resume-book {
    display: none;
  }

  .envelope {
    width: 620px;
    height: 520px;
    transform: translateX(-50%);
  }

  .float-actions {
    right: 22px;
    bottom: 28px;
  }
}
</style>
