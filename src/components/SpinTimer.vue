<template>
    <div class="spin-timer">
        <p v-if="secondsToSpin > 0" class="spin-timer__text">
            Next spin in {{ secondsToSpin }} seconds
        </p>
        <p v-else class="spin-timer__text">
            The wheel is spinning...
        </p>
    </div>
</template>

<script>
import { onMounted, onUnmounted, watch, ref } from '@vue/runtime-core';
export default {
    name: "SpinTimer",
    props: [
        "startDelta",
        "fakeStartDelta"
    ],
    setup(props) {
        const secondsToSpin = ref(props.fakeStartDelta);
        let decrementInterval = null;

        const startDecrement = () => {
            decrementInterval = setInterval(() => {
                secondsToSpin.value--;
                if (secondsToSpin.value === 0) {
                    clearInterval(decrementInterval);
                }
            }, 1000);
        };

        watch(() => props.fakeStartDelta, () => {
            secondsToSpin.value = props.fakeStartDelta;
            clearInterval(decrementInterval);
            startDecrement();
        });

        onMounted(() => {
            startDecrement();
        });

        onUnmounted(() => {
            clearInterval(decrementInterval);
        });

        return {
            secondsToSpin
        };
    }
}
</script>

<style lang="scss" scoped src="@/assets/styles/components/spin-timer.scss"></style>
