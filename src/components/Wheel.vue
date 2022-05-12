<template>
    <div class="wheel__container">
        <canvas id="wheelCanvas" class="wheel" height="400" width="400">
            Canvas is not supported, please try a different browser.
        </canvas>
        <div class="wheel__backgound"></div>
        <div class="wheel__backgound-center"></div>
        <div class="wheel__backgound-center-point"></div>
    </div>
</template>

<script>
import { onMounted, watch, reactive, ref } from "vue";
import Winwheel from "winwheeljs";

export default {
    name: "WheelComponent",
    props: [
        "configuration",
        "wheelID",
        "winningNumber",
        "isSpinning"
    ],
    setup(props) {
        const currentWheel = reactive({ wheel: null });
        const isSpinning = ref(false);

        const colors = {
            red: "#d9534f",
            green: "#449d44",
            black: "#000",
        };

        const startSpin = () => {
            // don't start a new spin if the wheel is already spinning
            if (!isSpinning.value) {
                currentWheel.wheel.startAnimation();
                isSpinning.value = true;
            }
        };

        const resetWheel = () => {
            // false as param so that it doesn't call callback function
            currentWheel.wheel.stopAnimation(false);
            isSpinning.value = false;
        };

        const drawWheel = () => {
            const elementsCount = props.configuration.results.length;

            // create array of objects that contain block(number box) color and text
            const segments = props.configuration.positionToId.map((pos) => {
                return {
                    fillStyle: colors[props.configuration.colors[pos]],
                    text: props.configuration.results[pos]
                };
            });

            // documentation can be found here:
            // https://github.com/zarocknz/javascript-winwheel/blob/master/Winwheel.js
            currentWheel.wheel = new Winwheel({
                'canvasId'        : 'wheelCanvas',
                'responsive'      : true,
                'textFillStyle'   : 'white',
                'outerRadius'     : 200, // outer circle (with numbers)
                'innerRadius'     : 95, // inner circle (empty)
                'textFontSize'    : 17,
                'textOrientation' : 'curved',
                'textAlignment'   : 'outer',
                'numSegments'     : elementsCount,
                'segments'        : segments,
                'animation'       :
                {
                    'type'     : 'spinOngoing', // linear
                    // in 1 second (duration) spin 1 time (spins):
                    'duration' : 1,
                    'spins'    : 1,
                    'repeat'   : -1 // repeat forever (until stopped)
                }
            });
        };

        onMounted(() => {
            drawWheel();
        });

        watch(() => props.wheelID, () => {
            drawWheel();
        });

        watch(() => props.isSpinning, () => {
            resetWheel();

            // if props.isSpinning is true, it means that 
            // a trigger for wheel spin start was fired
            if (props.isSpinning) {
                startSpin();
            }
        });

        return {
            startSpin,
            resetWheel
        };
    }
}
</script>

<style lang="scss" scoped src="@/assets/styles/components/wheel.scss"></style>