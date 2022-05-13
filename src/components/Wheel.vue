<template>
    <div class="wheel__container">
        <canvas id="wheelCanvas" class="wheel" height="400" width="400">
            Canvas is not supported, please try a different browser.
        </canvas>
        <div class="wheel__background"></div>
        <div class="wheel__background-center"></div>
        <div class="wheel__background-center-point"></div>
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
        const animationTimeouts = reactive({ timeouts: [] });

        // general block colors
        const colors = {
            red: "#d9534f",
            green: "#449d44",
            black: "#000",
        };

        // colors for winning number animation
        const winAnimationColors = [
            "deeppink",
            "chartreuse",
            "lightskyblue",
            "gold",
            "navy"
        ];

        const startSpin = () => {
            // don't start a new spin if the wheel is already spinning
            // (never really happens but still a useful protection just in case)
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

            // create array of objects that contain wheel segment color and text
            const segments = props.configuration.positionToId.map((pos) => {
                return {
                    fillStyle: colors[props.configuration.colors[pos]],
                    text: props.configuration.results[pos]
                };
            });

            // documentation can be found here:
            // http://dougtesting.net/home
            currentWheel.wheel = new Winwheel({
                'canvasId'        : 'wheelCanvas',
                'textFillStyle'   : 'white', // text color
                'outerRadius'     : 200, // outer circle (with numbers)
                'innerRadius'     : 95, // inner circle (empty)
                'textFontSize'    : 18,
                'textOrientation' : 'curved',
                'textAlignment'   : 'outer', // on the outer edge of the wheel
                'numSegments'     : elementsCount,
                'segments'        : segments,
                'animation'       : {
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
            // clear winning number animation in case the user
            // changed the wheel during the animation
            animationTimeouts.timeouts.forEach((id) => {
                clearTimeout(id);
            });
            animationTimeouts.timeouts = [];

            // re-draw the wheel to remove any color changes left over from before
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

        watch(() => props.winningNumber, () => {
            // if a new winning number is observed,
            // show an animation for that number
            if (props.winningNumber !== -1) { 
                const blinkTimeout = 500; // ms
                const loopTimes = 2; // how many times to loop over the same colors array
                let id = -1; // id of winning number segment(block) in the wheel

                // find winning number segment id in the wheel
                for (let seg = 0; seg < currentWheel.wheel.segments.length; seg++) {
                    if (currentWheel.wheel.segments[seg] && // for some reason the segment is sometimes null
                        currentWheel.wheel.segments[seg].text === props.winningNumber) {
                        id = seg;
                        break;
                    }
                }

                // id should always be present but just in case it's not,
                // don't show the animation
                if (id) {
                    const originalBackgroundColor = currentWheel.wheel.segments[id].fillStyle;

                    // make the winning number block blink with different colors
                    // for `loopTimes` number of loops, with `blinkTimeout` ms between colors
                    for (let loop = 0; loop < loopTimes; loop++) {
                        const timeoutUntilNextLoop = loop * winAnimationColors.length * blinkTimeout;

                        winAnimationColors.forEach((color, i) => {
                            const timeoutID = setTimeout(() => {
                                currentWheel.wheel.segments[id].fillStyle = color;
                                currentWheel.wheel.draw();
                            }, blinkTimeout * i + timeoutUntilNextLoop);

                            animationTimeouts.timeouts.push(timeoutID);
                        });
                    }

                    // reset the original block color at the end of the animation
                    const timeoutID = setTimeout(() => {
                        currentWheel.wheel.segments[id].fillStyle = originalBackgroundColor;
                        currentWheel.wheel.draw();
                    }, blinkTimeout * winAnimationColors.length * loopTimes);

                    animationTimeouts.timeouts.push(timeoutID);
                }
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
