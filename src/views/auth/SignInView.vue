<template>
    <div class="relative flex items-center p-0 overflow-hidden bg-center bg-cover min-h-75-screen">
        <div class="container z-10">
            <div class="flex flex-wrap mt-0 -mx-3">
                <div
                    class="flex flex-col w-full max-w-full px-3 mx-auto md:flex-0 shrink-0 md:w-6/12 lg:w-5/12 xl:w-4/12">
                    <div
                        class="relative flex flex-col min-w-0 mt-32 break-words bg-transparent border-0 shadow-none rounded-2xl bg-clip-border">
                        <div class="p-6 pb-0 mb-0 bg-transparent border-b-0 rounded-t-2xl">
                            <h3
                                class="relative z-10 font-bold text-transparent bg-gradient-to-tl from-primary-600 to-primary-400 bg-clip-text">
                                {{ t('auth.signIn') }}
                            </h3>
                            <p class="mb-0">{{ t('auth.signInHint') }}</p>
                        </div>

                        <div class="flex-auto p-6">
                            <form role="form" @submit.prevent="handleSubmit">
                                <label class="mb-2 ml-1 font-bold text-xs text-slate-700">
                                    {{ t('auth.email') }}
                                </label>
                                <div class="mb-1">
                                    <input type="email" v-model="form.email"
                                        class="focus:shadow-soft-primary-outline text-sm leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 transition-all focus:border-fuchsia-300 focus:outline-none focus:transition-shadow"
                                        placeholder="Email" aria-label="Email" aria-describedby="email-addon" />
                                </div>
                                <p v-if="errors.email" class="mb-4 text-xs text-red-600">{{ errors.email }}</p>

                                <label class="mb-2 ml-1 font-bold text-xs text-slate-700">
                                    {{ t('auth.password') }}
                                </label>
                                <div class="mb-1">
                                    <input type="password" v-model="form.password"
                                        class="focus:shadow-soft-primary-outline text-sm leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 transition-all focus:border-fuchsia-300 focus:outline-none focus:transition-shadow"
                                        placeholder="Password" aria-label="Password"
                                        aria-describedby="password-addon" />
                                </div>
                                <p v-if="errors.password" class="mb-4 text-xs text-red-600">{{ errors.password }}</p>

                                <div class="min-h-6 mb-0.5 block pl-12">
                                    <input id="rememberMe" v-model="form.rememberMe"
                                        class="mt-0.54 rounded-10 duration-250 ease-soft-in-out after:rounded-circle after:shadow-soft-2xl after:duration-250 checked:after:translate-x-5.25 h-5 relative float-left -ml-12 w-10 cursor-pointer appearance-none border border-solid border-gray-200 bg-primary-800/10 bg-none bg-contain bg-left bg-no-repeat align-top transition-all after:absolute after:top-px after:h-4 after:w-4 after:translate-x-px after:bg-white after:content-[''] checked:border-primary-800/95 checked:bg-primary-800/95 checked:bg-none checked:bg-right"
                                        type="checkbox" />
                                    <label
                                        class="mb-2 ml-1 font-normal cursor-pointer select-none text-sm text-slate-700"
                                        for="rememberMe">
                                        {{ t('auth.rememberMe') }}
                                    </label>
                                </div>

                                <div class="text-center">
                                    <button type="submit" :disabled="isSubmitting"
                                        class="inline-block w-full px-6 py-3 mt-6 mb-0 font-bold text-center text-white uppercase align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer shadow-soft-md bg-x-25 bg-150 leading-pro text-xs ease-soft-in tracking-tight-soft bg-gradient-to-tl from-primary-600 to-primary-400 hover:scale-102 hover:shadow-soft-xs active:opacity-85 disabled:opacity-50">
                                        {{ isSubmitting ? 'Anmelden...' : t('auth.signIn') }}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div
                            class="p-6 px-1 pt-0 text-center bg-transparent border-t-0 border-t-solid rounded-b-2xl lg:px-2">
                            <p class="mx-auto mb-6 leading-normal text-sm">
                                {{ t('auth.noAccount') }}
                                <a href="../pages/sign-up.html"
                                    class="relative z-10 font-semibold text-transparent bg-gradient-to-tl from-primary-600 to-primary-400 bg-clip-text">
                                    {{ t('auth.register') }}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="w-full max-w-full px-3 lg:flex-0 shrink-0 md:w-6/12">
                    <div
                        class="absolute top-0 hidden w-3/5 h-full -mr-32 overflow-hidden -skew-x-10 -right-40 rounded-bl-xl md:block">
                        <div class="absolute inset-x-0 top-0 z-0 h-full -ml-16 bg-cover skew-x-10"
                            :style="{ backgroundImage: `url(${CurvedImg6})` }"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from '@stratton-cologne/vue-smart-toast'
import CurvedImg6 from '@/assets/images/background/default.jpg'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()

const appTitle = import.meta.env.VITE_APP_TITLE || 'Stratton Cologne'
const envLogo = (import.meta.env.VITE_APP_LOGO_URL as string) || ''

const localLogos = import.meta.glob('/src/assets/logo.*', { eager: true, as: 'url' })

const form = reactive({
    email: '',
    password: '',
    rememberMe: false,
})

const errors = reactive({
    email: '',
    password: '',
})

const isSubmitting = ref(false)

const handleSubmit = async () => {
    // Fehler zurücksetzen
    errors.email = ''
    errors.password = ''
    isSubmitting.value = true

    try {
        await authStore.login(form.email, form.password)

        showToast({
            key: 'login-success',
            message: t('toast.loginSuccess'),
            type: 'success',
            duration: 3000,
            position: 'top-right',
        })

        router.push('/dashboard')
    } catch (error: any) {
        console.error('Login failed:', error)

        // 401 → Feldfehler für PW
        if (error?.response?.status === 401) {
            errors.password = t('auth.invalidCredentials')
        }

        showToast({
            key: 'login-error',
            message: t('toast.loginFailed'),
            type: 'error',
            duration: 3000,
            position: 'top-right',
        })
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    document.title = appTitle
})
</script>
