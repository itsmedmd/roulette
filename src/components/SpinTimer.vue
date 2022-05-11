<template>
    <div class="spin-timer">
        <p v-if="secondsToFakeSpin > 0" class="spin-timer__text">
            Next spin in <b>{{ secondsToFakeSpin }}</b> seconds
            (wheel {{ $props.wheelID }})
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
        "secondsTillSpin",
        "secondsTillFakeSpin",
        "wheelID"
    ],
    setup(props, {emit}) {
        const secondsToFakeSpin = ref(props.secondsTillFakeSpin);
        const secondsToRealSpin = ref(props.secondsTillSpin);
        let decrementInterval = null;

        const startDecrement = () => {
            decrementInterval = setInterval(() => {
                secondsToFakeSpin.value--;
                secondsToRealSpin.value--;

                if (secondsToRealSpin.value === 0) {
                    // stop decrementing because there's no need for it anymore
                    clearInterval(decrementInterval);
                    emit("gameStarted");
                }
            }, 1000);
        };

        watch(() => props.secondsTillFakeSpin, () => {
            secondsToFakeSpin.value = props.secondsTillFakeSpin;
            secondsToRealSpin.value = props.secondsTillSpin;

            // restart interval
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
            secondsToFakeSpin
        };
    }
}
</script>

<style lang="scss" scoped src="@/assets/styles/components/spin-timer.scss"></style>
