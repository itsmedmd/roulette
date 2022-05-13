<template>
    <div class="app">
        <h1 class="app__title">Roulette game</h1>
        <URLInputField v-model:url="inputURL" />

        <ActionsLog :log="actionsLog.log" />

        <main v-if="gameData.data">
            <div class="app__stats-row">
                <SpinTimer
                    :wheelID="gameData.data.wheelID"
                    :secondsTillSpin="gameData.data.startDelta"
                    :secondsTillFakeSpin="gameData.data.fakeStartDelta"
                    :newGameTrigger="newGameTrigger"
                    @fakeSpin="handleFakeSpin"
                    @gameStarted="handleRealSpin"
                />
                <SpinHistory
                    :wheelID="gameData.data.wheelID"
                    :configuration="configuration"
                    :history="pastResults.numbers[gameData.data.wheelID]"
                />
            </div>

            <div class="app__game-board">
                <Wheel
                    :configuration="configuration"
                    :wheelID="gameData.data.wheelID"
                    :winningNumber="winningNumber"
                    :isSpinning="isSpinning"
                />
                <Board
                    :configuration="configuration"
                    :wheelID="gameData.data.wheelID"
                    :winningNumber="winningNumber"
                    @log="addActionLogMessage"
                />
            </div>

            <Statistics
                :wheelID="gameData.data.wheelID"
                :url="currentURL"
                :configuration="configuration"
                :fetchTrigger="statsTrigger"
                @log="addActionLogMessage"
            />
        </main>
    </div>
</template>

<script>
import { ref, reactive, watch, onMounted } from "vue";
import customFetch from "./assets/scripts/customFetch";

import URLInputField from "./components/URLInputField";
import Statistics from "./components/Statistics";
import SpinTimer from "./components/SpinTimer";
import SpinHistory from "./components/SpinHistory";
import Wheel from "./components/Wheel";
import Board from "./components/Board";
import ActionsLog from "./components/ActionsLog";

export default {
    name: "App",
    components: {
        URLInputField,
        Statistics,
        SpinTimer,
        SpinHistory,
        Wheel,
        Board,
        ActionsLog
    },
    setup() {
        const refetchTimeout = 1000; // ms

        // default url values
        const baseURL = "https://dev-games-backend.advbet.com/v1/ab-roulette/";
        const baseID = 1;
        const currentURL = ref(baseURL + baseID);

        // input url is a separate variable for validation
        const inputURL = ref(baseURL + baseID);

        // current and previous game data
        const gameData = reactive({ data: null });
        const pastResults = reactive({ numbers: [] });
        const statsTrigger = ref(true);
        const newGameTrigger = ref(true);
        const winningNumber = ref(-1);
        const isSpinning = ref(false);

        // configuration
        const configuration = reactive({
            colors: [],
            results: [],
            positionToId: []
        });

        const actionsLog = reactive({
            log: []
        });

        watch(() => inputURL.value, () => {
            // validate if the new URL has the same beginning as `baseURL`
            const urlStart = inputURL.value.slice(0, baseURL.length);
            if (urlStart === baseURL) {
                // split[1] is what comes after `baseURL`
                const split = inputURL.value.split(baseURL);

                // if split[1] exists, is a number and the new URL is not the same
                // as the last one, update `currentURL`
                if (split[1] && !isNaN(split[1]) && inputURL.value !== currentURL.value) {
                    currentURL.value = inputURL.value;

                    // also update wheel configuration
                    getWheelConfiguration(currentURL.value);
                }
            }
        });

        const getWheelConfiguration = (url) => {
            actionsLog.log.push(`${new Date().toISOString()}: GET .../configuration`);

            customFetch({
                url: url + "/configuration",
                onSuccess: (data) => {
                    if (!data.colors && !data.results && !data.positionToId) {
                        throw new Error("No data found");
                    } else {
                        configuration.colors = data.colors;
                        configuration.results = data.results;
                        configuration.positionToId = data.positionToId;

                        // reset winning number and wheel
                        winningNumber.value = -1;
                        isSpinning.value = false;

                        // get new game data for the new wheel
                        getNextGame(url);
                    }
                },
                onError: (err) => {
                    console.error("Configuration fetch failed:", err);

                    // refetch
                    if (url === currentURL.value) {
                        actionsLog.log.push(`${new Date().toISOString()}: (timeout) GET .../configuration in ${refetchTimeout}ms`);
                        setTimeout(() => getWheelConfiguration(url), refetchTimeout);
                    } else {
                        actionsLog.log.push(`${new Date().toISOString()}: GET .../configuration failed and wheel changed, stopping refetch`);
                    }
                }
            });
        };

        const getNextGame = (url) => {
            actionsLog.log.push(`${new Date().toISOString()}: GET .../nextGame`);

            customFetch({
                url: url + "/nextGame",
                onSuccess: (data) => {
                    if (!data) {
                        throw new Error("No data found");
                    } else {
                        actionsLog.log.push(`${new Date().toISOString()}: fake wheel spin will start in ${data.fakeStartDelta}s`);
                        gameData.data = data;

                        // update current game wheelID
                        const slice = url.slice("/");
                        gameData.data.wheelID = slice[slice.length - 1];

                        // trigger timer to reset
                        newGameTrigger.value = !newGameTrigger.value;
                    }
                },
                onError: (err) => {
                    console.error("Next game fetch failed:", err);

                    // refetch
                    if (url === currentURL.value) {
                        actionsLog.log.push(`${new Date().toISOString()}: (timeout) GET .../nextGame in ${refetchTimeout}ms`);
                        setTimeout(() => getNextGame(url), refetchTimeout);
                    } else {
                        actionsLog.log.push(`${new Date().toISOString()}: GET .../nextGame failed and wheel changed, stopping refetch`);
                    }
                }
            });
        };

        const getGameResults = (uuid, url) => {
            actionsLog.log.push(`${new Date().toISOString()}: GET .../game/${uuid}`);

            customFetch({
                url: url + "/game/" + uuid,
                onSuccess: (data) => {
                    if (!data.result && !data.outcome) {
                        throw new Error("No data found");
                    } else {
                        actionsLog.log.push(`${new Date().toISOString()}: game outcome is ${data.outcome}, stopping wheel`);

                        // set winning number information and stop the wheel
                        winningNumber.value = data.outcome;
                        isSpinning.value = false;

                        // create an array indexed by wheel id, so that only
                        // history relevant to the current wheel is displayed
                        if (!pastResults.numbers[gameData.data.wheelID]) {
                            pastResults.numbers[gameData.data.wheelID] = [];
                        }

                        pastResults.numbers[gameData.data.wheelID].push({
                            id: data.result,
                            number: data.outcome,
                            date: new Date()
                        });
                        
                        // update statistics and get next game
                        statsTrigger.value = !statsTrigger.value;
                        getNextGame(url);
                    }
                },
                onError: (err) => {
                    console.error("Next game fetch failed:", err);

                    // refetch
                    if (uuid === gameData.data.uuid) {
                        actionsLog.log.push(`${new Date().toISOString()}: (timeout) GET .../game/${uuid} in ${refetchTimeout}ms`);
                        setTimeout(() => getGameResults(uuid, url), refetchTimeout);
                    } else {
                        actionsLog.log.push(`${new Date().toISOString()}: GET .../game/${uuid} failed and game uuid changed, stopping refetch`);
                    }
                }
            });
        };

        const handleFakeSpin = () => {
            actionsLog.log.push(`${new Date().toISOString()}: starting fake spin`);
            isSpinning.value = true;
        };

        const handleRealSpin = () => {
            getGameResults(gameData.data.uuid, currentURL.value);
        };

        const addActionLogMessage = (message) => {
            actionsLog.log.push(message);
        };

        onMounted(() => {
            getWheelConfiguration(currentURL.value);
        });

        return {
            inputURL,
            currentURL,
            configuration,
            gameData,
            winningNumber,
            handleRealSpin,
            handleFakeSpin,
            isSpinning,
            pastResults,
            statsTrigger,
            newGameTrigger,
            actionsLog,
            addActionLogMessage,
        };
    }
};
</script>

<style lang="scss" scoped src="@/assets/styles/app.scss"></style>
