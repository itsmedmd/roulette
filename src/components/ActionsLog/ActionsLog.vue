<template>
    <div class="actions-log">
        <h3 class="actions-log__title">Actions log</h3>
        <ul
            ref="list"
            class="actions-log__list"
            v-if="$props.log.length"
            tabindex="0"
            role="region"
            aria-label="Actions log"
        >
            <li
                v-for="(action, id) in $props.log"
                :key="`${action}-${id}`"
                class="actions-log__action"
            >
                {{ action }}
            </li>
        </ul>
        <p v-else>There are no actions yet</p>
    </div>
</template>

<script>
import { ref, onUpdated } from "vue";

export default {
    name: "ActionsLog",
    props: [
        "log"
    ],
    setup() {
        const list = ref(null);

        // walways keep the list scrolled to the bottom
        onUpdated(() => {
            if (list.value) {
                list.value.scrollTop = list.value.scrollHeight;
            }
        });

        return {
            list
        };
    }
}
</script>

<style lang="scss" scoped src="./actions-log.scss"></style>
