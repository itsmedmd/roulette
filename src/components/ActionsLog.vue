<template>
    <div class="actions-log">
        <h3 class="actions-log__title">Actions log</h3>
        <ul ref="list" class="actions-log__list" v-if="$props.log.length">
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
    props: [ "log" ],
    setup() {
        const list = ref(null);

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

<style lang="scss" scoped src="@/assets/styles/components/actions-log.scss"></style>
