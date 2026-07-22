<template>
  <div v-if="state !== 'none'" class="scan-splash">
    <div class="scan-splash-card">
      <div class="scan-splash-title">
        {{ state === 'granted' ? 'ACCESS GRANTED' : state === 'expired' ? 'SESSION EXPIRED' : 'VERIFYING…' }}
      </div>
      <div class="scan-splash-text">
        {{
          state === 'granted' ? 'The classified section is unlocked on the big screen.'
          : state === 'expired' ? 'Reload the page on the big screen and scan again.'
          : 'Checking the code…'
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

  import { onMounted, ref } from 'vue';

  import { claimUnlockFromUrl } from '@modules/classifiedUnlockSession';

  // 'none' also covers the desktop, which never carries the `unlock` query param.
  const state = ref<'none' | 'pending' | 'granted' | 'expired'>('none');

  onMounted(async () => {
    if (!new URLSearchParams(window.location.search).has('unlock')) return;
    state.value = 'pending';
    state.value = (await claimUnlockFromUrl()) ? 'granted' : 'expired';
  });

</script>

<style scoped lang="scss">
  .scan-splash {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #181818;
  }

  .scan-splash-card {
    width: 100%;
    max-width: 320px;
    padding: 24px 20px;
    text-align: center;
    border: 1px dashed #2a2a2a;
    border-radius: 8px;
    background: rgba(23, 23, 23, 0.6);
  }

  .scan-splash-title {
    font-family: 'Audiowide';
    font-size: 13px;
    letter-spacing: 3px;
    color: #f09b3a;
    margin-bottom: 10px;
  }

  .scan-splash-text {
    font-family: 'Mono';
    font-size: 12px;
    line-height: 1.6;
    color: #6a6a6a;
  }
</style>
