<template>
    <div class="w-full px-6 py-6 mx-auto">

        <div class="w-full px-6 py-6 mx-auto">
            <!-- Row 1 -->
            <h1>{{ t('dashboard.title') }}</h1>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

</script>
