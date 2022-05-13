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
import { onMounted, onUnmounted, watch, ref } from "vue";

export default {
    name: "SpinTimer",
    props: [
        "secondsTillSpin",
        "secondsTillFakeSpin",
        "wheelID",
        "newGameTrigger"
    ],
    setup(props, {emit}) {
        const secondsToFakeSpin = ref(props.secondsTillFakeSpin);
        const secondsToRealSpin = ref(props.secondsTillSpin);
        let decrementInterval = null;

        // decrement by 1 second
        const startDecrement = () => {
            decrementInterval = setInterval(() => {
                secondsToFakeSpin.value--;
                secondsToRealSpin.value--;

                if (secondsToFakeSpin.value === 0) {
                    emit("fakeSpin");
                }

                if (secondsToRealSpin.value === 0) {
                    emit("gameStarted");
                }
            }, 1000);
        };

        watch(() => props.newGameTrigger, () => {
            secondsToFakeSpin.value = props.secondsTillFakeSpin;
            secondsToRealSpin.value = props.secondsTillSpin;

            // if the user observes a new wheel while it should be fake spinning,
            // immediately start fake spin
            if (secondsToFakeSpin.value <= 0) {
                emit("fakeSpin");
            }

            // if the user navigates to a new wheel at the moment when
            // it should be starting a new game, immediately start the game
            if (secondsToRealSpin.value <= 0) {
                emit("gameStarted");
            }

            // restart the interval with new times when a new game is observed
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

<style lang="scss" scoped src="./spin-timer.scss"></style>
