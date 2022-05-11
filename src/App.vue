<template>
    <div class="app">
        <h1 class="app__title">Roulette game</h1>
        <URLInputField v-model:url="inputURL" />
        <div class="app__stats-row">
            <SpinTimer
                v-if="gameData.data"
                :wheelID="gameData.data.wheelID"
                :secondsTillSpin="gameData.data.startDelta"
                :secondsTillFakeSpin="gameData.data.fakeStartDelta"
                @gameStarted="handleGameStart"
            />
            <SpinHistory
                v-if="gameData.data"
                :wheelID="gameData.data.wheelID"
                :configuration="configuration"
                :history="pastResults.numbers[currentWheelID]"
            />
        </div>
        <Board />
        <Statistics
            v-if="gameData.data"
            :wheelID="gameData.data.wheelID"
            :url="currentURL"
            :configuration="configuration"
            :fetchTrigger="statsTrigger"
        />
    </div>
</template>

<script>
import { ref, reactive, watch, onMounted } from "vue";

import URLInputField from "./components/URLInputField.vue";
import Statistics from "./components/Statistics.vue";
import SpinTimer from "./components/SpinTimer.vue";
import SpinHistory from "./components/SpinHistory.vue";
import Board from "./components/Board.vue";

import customFetch from "./assets/scripts/customFetch";

export default {
    name: "App",
    components: {
        URLInputField,
        Statistics,
        SpinTimer,
        SpinHistory,
        Board
    },
    setup() {
        const refetchTimeout = 500; // ms

        // default url values
        const baseURL = "https://dev-games-backend.advbet.com/v1/ab-roulette/";
        const baseID = 1;
        const currentURL = ref(baseURL + baseID);
        const currentWheelID = ref(baseID);

        // input url is a separate variable for validation
        const inputURL = ref(baseURL + baseID);

        // current and previous game data
        const gameData = reactive({ data: null });
        const pastResults = reactive({ numbers: [] });
        const statsTrigger = ref(true);

        // configuration
        const configuration = reactive({
            colors: [],
            results: []
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
                    currentWheelID.value = split[1];
                    currentURL.value = inputURL.value;

                    // also update wheel configuration
                    getWheelConfiguration(currentURL.value);
                }
            }
        });

        const getWheelConfiguration = (url) => {
            customFetch({
                url: url + "/configuration",
                onSuccess: (data) => {
                    if (!data.colors && !data.results) {
                        throw new Error("No data found");
                    } else {
                        configuration.colors = data.colors;
                        configuration.results = data.results;

                        // get new game data for the new wheel
                        getNextGame(url);
                    }
                },
                onError: (err) => {
                    console.error("Configuration fetch failed:", err);
                    // refetch
                    if (url === currentURL.value) {
                        setTimeout(() => getWheelConfiguration(url), refetchTimeout);
                    }
                }
            });
        };

        const getNextGame = (url) => {
            customFetch({
                url: url + "/nextGame",
                onSuccess: (data) => {
                    if (!data) {
                        throw new Error("No data found");
                    } else {
                        gameData.data = data;
                        // the last element of slice should always be wheelID
                        const slice = url.slice("/");
                        gameData.data.wheelID = slice[slice.length - 1];
                    }
                },
                onError: (err) => {
                    console.error("Next game fetch failed:", err);
                    // refetch
                    if (url === currentURL.value) {
                        setTimeout(() => getNextGame(url), refetchTimeout);
                    }
                }
            });
        };

        const getGameResults = (uuid, url) => {
            customFetch({
                url: url + "/game/" + uuid,
                onSuccess: (data) => {
                    if (!data.result && !data.outcome) {
                        throw new Error("No data found");
                    } else {
                        // create an array indexed by wheel id, so that only
                        // history relevant to the current wheel is displayed
                        if (!pastResults.numbers[currentWheelID.value]) {
                            pastResults.numbers[currentWheelID.value] = [];
                        }

                        pastResults.numbers[currentWheelID.value].push({
                            id: data.result,
                            number: data.outcome
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
                        setTimeout(() => getGameResults(uuid, url), refetchTimeout);
                    }
                }
            });
        };

        const handleGameStart = () => {
            getGameResults(gameData.data.uuid, currentURL.value);
        }

        onMounted(() => {
            getWheelConfiguration(currentURL.value);
        });

        return {
            inputURL,
            currentURL,
            currentWheelID,
            configuration,
            gameData,
            handleGameStart,
            pastResults,
            statsTrigger
        };
    }
};
</script>

<style lang="scss" scoped src="@/assets/styles/components/app.scss"></style>
