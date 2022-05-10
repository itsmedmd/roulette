<template>
    <div class="url-field">
        <label for="url-input" class="url-field__label">Base API URL:</label>
        <br>
        <input
            id="url-input"
            type="text"
            class="url-field__input"
            :value="url"
            @input="handleInputChange"
        >
    </div>
</template>

<script>
export default {
    name: "URLInputField",
    props: [
        "url"
    ],
    setup(props, {emit}) {
        const handleInputChange = (event) => {
            emit("update:url", event.target.value);
        };

        return {
            handleInputChange
        };
    }
}
</script>

<style lang="scss" scoped src="@/assets/styles/components/url-input-field.scss"></style>