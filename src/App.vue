<template>
    <div class="app">
        <URLInputField v-model:url="baseURL"/>
    </div>
</template>

<script>
import { ref, watch } from "vue";
import URLInputField from "./components/URLInputField.vue";

export default {
    name: "App",
    components: {
        URLInputField
    },
    setup() {
        const baseURL = ref("https://dev-games-backend.advbet.com/v1/ab-roulette/1");

        watch(() => baseURL.value, () => {
            console.log(baseURL.value);
        });

        return {
            baseURL
        };
    }
};
</script>

<style lang="scss" scoped src="@/assets/styles/components/app.scss"></style>
