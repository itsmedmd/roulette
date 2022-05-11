<template>
    <div class="actions-log">
        <h3 class="actions-log__title">Actions log</h3>
        <ul class="actions-log__list" v-if="$props.log.length">
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
export default {
    name: "ActionsLog",
    props: [ "log" ]
}
</script>

<style lang="scss" scoped src="@/assets/styles/components/actions-log.scss"></style>
