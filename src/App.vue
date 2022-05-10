<template>
    <div class="app">
        <URLInputField v-model:url="inputURL" />
        <Statistics :url="currentURL "/>
    </div>
</template>

<script>
import { ref, watch } from "vue";
import URLInputField from "./components/URLInputField.vue";
import Statistics from "./components/Statistics.vue";

export default {
    name: "App",
    components: {
        URLInputField,
        Statistics
    },
    setup() {
        // default url values
        const baseURL = "https://dev-games-backend.advbet.com/v1/ab-roulette/";
        const baseID = 1;
        const currentURL = ref(baseURL + baseID);

        // input url is a separate variable for validation
        const inputURL = ref(baseURL + baseID);

        watch(() => inputURL.value, () => {
            // validate if the new URL has the same beginning as `baseURL`
            const urlStart = inputURL.value.slice(0, baseURL.length);
            if (urlStart === baseURL) {
                // split[1] is what comes after `baseURL`
                const split = inputURL.value.split(baseURL);

                // if split[1] exists, is a number and the new URL is not the same
                // as the last one, update `currentURL`
                if (split[1] && !isNaN(split[1]) && inputURL.value !== currentURL.value) {
                    currentURL.value = inputURL.value;
                }
            }
        });

        return {
            inputURL,
            currentURL
        };
    }
};
</script>

<style lang="scss" scoped src="@/assets/styles/components/app.scss"></style>
