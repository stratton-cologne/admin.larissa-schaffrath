import { createApp } from "vue";
import { createPinia } from "pinia";

import router from "@/router";
import { i18n, ensureInitialLocale } from "@/i18n";

import App from "./app.vue";
import "./assets/style/style.css";
import "@stratton-cologne/vue-smart-toast/style.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

ensureInitialLocale();

app.mount("body");
