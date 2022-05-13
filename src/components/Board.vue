<template>
    <div class="board">
        <div class="board__table-container">
            <div class="board__zeroes-container">
                <div
                    v-for="(zero, zeroID) in zeroes.numbers"
                    :key="`board-zero-${zeroID}`"
                    class="number-block block-green board__number board__zero"
                >
                    <span class="board__zero-text">{{ zero.number }}</span>
                </div>
            </div>

            <div class="board__table">
                <div
                    v-for="rowNum in [3, 2, 1]"
                    :key="`board-row-${rowNum}`"
                    class="board__table-row"
                >
                    <div
                        v-for="i in board.numbers.length / 3"
                        :key="`board-num-${i * rowNum}`"
                        class="number-block board__number"
                        :class="[
                            `block-${board.numbers[rowNum + ((i - 1) * 3) - 1].color}`,
                            {
                                'board__number--winning':
                                board.numbers[rowNum + ((i - 1) * 3) - 1].number === $props.winningNumber
                            }
                        ]"
                    >
                        {{ board.numbers[rowNum + ((i - 1) * 3) - 1].number }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { onMounted, reactive, watch } from "vue";

export default {
    name: "RouletteBoard",
    props: [
        "configuration",
        "wheelID",
        "winningNumber"
    ],
    setup(props, {emit}) {
        const board = reactive({ numbers: [] }); // without zeroes
        const zeroes = reactive({ numbers: [] }); // only zeroes

        // create a sorted array of board numbers
        const createSortedBoard = (config) => {
            const newBoard = [];
            config.results.forEach((number, i) => {
                newBoard.push({
                    number,
                    color: props.configuration.colors[i]
                });
            });

            // sort numbers in ascending order
            newBoard.sort((a, b) => a.number - b.number);
            board.numbers = newBoard;
        };

        // contains only zeroes
        const createZeroesArray = (numbers) => {
            const newZeroes = [];
            numbers.forEach((num) => {
                if (num.number < 1) {
                    newZeroes.push(num);
                }
            });
            zeroes.numbers = newZeroes;
        };

        // create board array and zeroes array
        const createBoard = () => {
            emit("log", `${new Date().toISOString()}: creating board`);
            createSortedBoard(props.configuration);
            createZeroesArray(board.numbers);

            // remove all zeroes from `board.numbers`
            board.numbers = board.numbers.filter(num => num.number >= 1);
        };

        watch(() => props.wheelID, () => {
            createBoard();
        });

        onMounted(() => {
            createBoard();
        });

        return {
            board,
            zeroes
        };
    }
}
</script>

<style lang="scss" scoped src="@/assets/styles/components/board.scss"></style>
