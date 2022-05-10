<template>
    <div class="statistics" v-show="$props.configuration.colors.length">
        <h2 class="statistics__title">Statistics of last 200 spins:</h2>
        <table class="statistics__table">
            <thead class="statistics__row">
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
                <tr class="statistics__row">
                    <th class="statistics__header">Slot</th>
                    <td
                        v-for="(slot, id) in statistics.stats"
                        :key="`${slot.result}-${id}-result`"
                        class="statistics__item"
                        :class="`block-${$props.configuration.colors[slot.result]}`"
                    >
                        {{ slot.result }}
                    </td>
                </tr>
                <tr class="statistics__row statistics__row--hits">
                    <th class="statistics__header">Hits</th>
                    <td
                        v-for="(slot, id) in statistics.stats"
                        :key="`${slot.result}-${id}-count`"
                        class="statistics__item"
                        :class="[
                            { 'hot': id < 5 },
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