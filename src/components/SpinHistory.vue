<template>
    <div class="spin-history" v-show="$props.configuration.colors.length">
        <h2 class="spin-history__title">
            Current session spin history for wheel {{ $props.wheelID }}:
        </h2>
        <table v-if="reversedHistory.length" class="spin-history__table">
            <tbody>
                <tr>
                    <td
                        v-for="(slot, id) in reversedHistory"
                        :key="`${slot}-${id}`"
                        class="number-block"
                        :class="`block-${$props.configuration.colors[slot.id]}`"
                    >
                        {{ slot.number }}
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-else class="spin-history__fallback-text">There is no history yet</p>
    </div>
</template>

<script>
import { computed } from "vue";

export default {
    name: "SpinHistory",
    props: [
        "configuration",
        "wheelID",
        "history",
    ],
    setup(props) {
        // sort history by date so that the first item is the most recent
        const reversedHistory = computed(() => {
            if (props.history) {
                const tempHistory = props.history;
                return tempHistory.sort((a, b) => b.date - a.date);
            }
            return [];
        });

        return {
            reversedHistory
        };
    }
}
</script>

<style lang="scss" scoped src="@/assets/styles/components/spin-history.scss"></style>
