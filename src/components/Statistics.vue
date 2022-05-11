<template>
    <div class="statistics" v-show="$props.configuration.colors.length">
        <h2 class="statistics__title">
            Statistics of last 200 spins for wheel {{ $props.wheelID }}:
        </h2>
        <table class="statistics__table">
            <thead>
                <tr>
                    <td></td>
                    <th class="statistics__header hot" colspan="5">Hot</th>
                    <th class="statistics__header" :colspan="statistics.stats.length - 10">
                        Neutral
                    </th>
                    <th class="statistics__header cold" colspan="5">Cold</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th class="statistics__header">Slot</th>
                    <td
                        v-for="(slot, id) in statistics.stats"
                        :key="`${slot.result}-${id}-result`"
                        class="number-block"
                        :class="`block-${$props.configuration.colors[slot.result]}`"
                    >
                        {{ $props.configuration.results[slot.result] }}
                    </td>
                </tr>
                <tr>
                    <th class="statistics__header">Hits</th>
                    <td
                        v-for="(slot, id) in statistics.stats"
                        :key="`${slot.result}-${id}-count`"
                        class="number-block"
                        :class="[
                            { 'hot': id < 5 },
                            { 'statistics__count' : id >= 5 && id < statistics.stats.length - 6 },
                            { 'cold': id >= statistics.stats.length - 5 }
                        ]"
                    >
                        {{ slot.count }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>

import { onMounted, watch, reactive } from "vue";
import customFetch from "../assets/scripts/customFetch";

export default {
    name: "StatisticsBlock",
    props: [
        "url",
        "configuration",
        "wheelID",
        "fetchTrigger"
    ],
    setup(props) {
        const refetchTimeout = 500; // ms

        const statistics = reactive({
            stats: []
        });

        const getStatistics = (url) => {
            customFetch({
                url: url + "/stats?limit=200",
                onSuccess: (data) => {
                    if (!data) {
                        throw new Error("No data found");
                    } else {
                        statistics.stats = data;
                        // sort stats by slot appearance count in descending order
                        statistics.stats.sort((a, b) => b.count - a.count);
                    }
                },
                onError: (err) => {
                    console.error("Statistics fetch failed:", err);
                    // refetch
                    if (url === props.url) {
                        setTimeout(() => getStatistics(url), refetchTimeout);
                    }
                }
            });
        }

        // `props.fetchTrigger` is manually triggered from App.vue
        // in order to update statistics when the current game ends 
        watch([() => props.url, () => props.fetchTrigger], () => {
            getStatistics(props.url);
        });

        onMounted(() => {
            getStatistics(props.url);
        });

        return {
            statistics
        };
    }
}
</script>

<style lang="scss" scoped src="@/assets/styles/components/statistics.scss"></style>