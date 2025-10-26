<template>
    <Notifications />
    <main
        class="ease-soft-in-out xl:ml-68.5 relative min-h-screen flex flex-col rounded-xl transition-all duration-200">
        <section class="main-content flex-1 min-h-0 overflow-auto">
            <RouterView />
        </section>
    </main>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Notifications } from '@stratton-cologne/vue-smart-toast';

</script>
