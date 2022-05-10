<template>
    <div class="statistics" v-show="$props.configuration.colors.length">
        <div
            v-for="(slot, id) in statistics.stats"
            :key="`${slot.result}-${id}`"
        >
            <p :style="{'background-color': $props.configuration.colors[slot.result]}">
                {{ slot.result }} count: {{ slot.count }}
            </p>
        </div>
    </div>
</template>

<script>

import { onMounted, watch, reactive } from "vue";

export default {
    name: "StatisticsBlock",
    props: [
        "url",
        "configuration"
    ],
    setup(props) {
        const statistics = reactive({
            stats: []
        });

        const getStatistics = () => {
            fetch(props.url + "/stats?limit=200")
            .then((res) => {
                if (res.status === 200) {
                    return res.json();
                }
                throw new Error("Something went wrong.");
            })
            .then((data) => {
                statistics.stats = data;
                statistics.stats.sort((a, b) => b.count - a.count);
            })
            .catch((err) => {
                console.error("Statistics fetch failed:", err);
            });
        };

        watch(() => props.url, () => {
            getStatistics();
        });

        onMounted(() => {
            getStatistics();
        });

        return {
            statistics
        };
    }
}
</script>

<style lang="scss" scoped src="@/assets/styles/components/statistics.scss"></style>