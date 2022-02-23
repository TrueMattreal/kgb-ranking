<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-toolbar>
                        Brettspieleranking von {{ ratings.length }} Spielen
                        <v-divider
                            class="mx-4"
                            inset
                            vertical
                        ></v-divider>
                        <v-switch
                            v-model="showOnlyRankedByAll"
                            label="von allen bewertet wurden"
                            class="mt-5 mr-5"
                        ></v-switch>
                        <v-switch
                            v-model="showOnlyNotRankedByAll"
                            label="nicht von allen bewertet wurden"
                            class="mt-5"
                        ></v-switch>
                        <template v-slot:extension>
                            <v-text-field
                                v-model="search"
                                append-icon="mdi-magnify"
                                label="Suche"
                                single-line
                                hide-details
                            ></v-text-field>
                        </template>
                    </v-toolbar>
                    <v-data-table
                        :headers="headers"
                        :items="ratings"
                        :search="search"
                        :disable-pagination="true"
                        :hide-default-footer="true"
                        :sort-by="['rank', 'name']"
                        class="elevation-1"
                        dense
                        expanded="true"
                    >
                        <template v-slot:item.name="{ item }">
                            <a :href="item.url" >{{item.name}}</a>
                        </template>
                        <template v-slot:item.averageRating="{ item }">
                            {{ toDecimal(item.averageRating) }}
                        </template>
                        <template v-slot:item.variance="{ item }">
                            {{ toDecimal(item.variance) }}
                        </template>
                        <template v-slot:item.highestDifference="{ item }">
                            {{ toDecimal(item.highestDifference) }}
                        </template>
                        <template v-slot:item.M__x="{ item, header }">
                            <template v-if="item.objectId + header.text in playerRatingStats">
                                <v-chip v-if="playerRatingStats[item.objectId + header.text].isMin && !playerRatingStats[item.objectId + header.text].isMax" color="red">
                                    {{ playerRatingStats[item.objectId + header.text].rating }}
                                </v-chip>
                                <v-chip v-else-if="playerRatingStats[item.objectId + header.text].isMax && !playerRatingStats[item.objectId + header.text].isMin" color="green">
                                    {{ playerRatingStats[item.objectId + header.text].rating }}
                                </v-chip>
                                <template v-else>
                                    {{ item[header.text] }}
                                </template>
                            </template>
                        </template>
                        <template v-slot:item.Mattreal="{ item, header }">
                            <template v-if="item.objectId + header.text in playerRatingStats">
                                <v-chip v-if="playerRatingStats[item.objectId + header.text].isMin && !playerRatingStats[item.objectId + header.text].isMax" color="red">
                                    {{ playerRatingStats[item.objectId + header.text].rating }}
                                </v-chip>
                                <v-chip v-else-if="playerRatingStats[item.objectId + header.text].isMax && !playerRatingStats[item.objectId + header.text].isMin" color="green">
                                    {{ playerRatingStats[item.objectId + header.text].rating }}
                                </v-chip>
                                <template v-else>
                                    {{ item[header.text] }}
                                </template>
                            </template>
                        </template>
                        <template v-slot:item.SeriousScribbler="{ item, header }">
                            <template v-if="item.objectId + header.text in playerRatingStats">
                                <v-chip v-if="playerRatingStats[item.objectId + header.text].isMin && !playerRatingStats[item.objectId + header.text].isMax" color="red">
                                    {{ playerRatingStats[item.objectId + header.text].rating }}
                                </v-chip>
                                <v-chip v-else-if="playerRatingStats[item.objectId + header.text].isMax && !playerRatingStats[item.objectId + header.text].isMin" color="green">
                                    {{ playerRatingStats[item.objectId + header.text].rating }}
                                </v-chip>
                                <template v-else>
                                    {{ item[header.text] }}
                                </template>
                            </template>
                        </template>
                        <template v-slot:item.tibosaeinbein="{ item, header }">
                            <template v-if="item.objectId + header.text in playerRatingStats">
                                <v-chip v-if="playerRatingStats[item.objectId + header.text].isMin && !playerRatingStats[item.objectId + header.text].isMax" color="red">
                                    {{ playerRatingStats[item.objectId + header.text].rating }}
                                </v-chip>
                                <v-chip v-else-if="playerRatingStats[item.objectId + header.text].isMax && !playerRatingStats[item.objectId + header.text].isMin" color="green">
                                    {{ playerRatingStats[item.objectId + header.text].rating }}
                                </v-chip>
                                <template v-else>
                                    {{ item[header.text] }}
                                </template>
                            </template>
                        </template>
                        <template v-slot:body.append="{}">
                            <tr>
                                <th class="title"></th>
                                <th class="title"></th>
                                <th class="title"></th>
                                <th class="title">Ø {{ toDecimal(totalAvarage) }}</th>
                                <th class="title"></th>
                                <th class="title"></th>
                                <th class="title"></th>
                                <th v-for="user in profiles" :key="user.name">
                                    Ø {{ toDecimal(playerRatings.filter(pr => pr.username === user).reduce((a,b) => a + b.rating, 0) / playerRatings.filter(pr => pr.username === user).length) }}
                                </th>
                            </tr>
                        </template>
                    </v-data-table>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h1>gruppierte Durchschnittsbewertung</h1>
                <ratings-grouped-chart :chart-data="groupedRatingChartData"></ratings-grouped-chart>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h1>Durchschnittsbewertung (insgesamt: {{ toDecimal(totalAvarage) }} )</h1>
                <rating-overview-chart :chart-data="chartData"></rating-overview-chart>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h1>Standardabweichung</h1>
                <rating-overview-chart :chart-data="varianceChart"></rating-overview-chart>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios'
import xmljs from 'xml-js'
import RatingOverviewChart from './RatingOverviewChart.vue'
import RatingsGroupedChart from './RatingsGroupedChart.vue'
import _ from 'lodash'

export default {
    components: {
        RatingOverviewChart,
        RatingsGroupedChart,
    },
    mounted() {
        if (this.games.length <= 0) {
            this.setCollection('283494')
        }
        if (this.profiles.length <= 0) {
            this.addNewProfile("M__x")
            this.addNewProfile("Mattreal")
            this.addNewProfile("SeriousScribbler")
            this.addNewProfile("tibosaeinbein")
        }
    },
    watch: {
        showOnlyRankedByAll(val) {
            if (val) {
                this.showOnlyNotRankedByAll = false
            }
        },
        showOnlyNotRankedByAll(val) {
            if (val) {
                this.showOnlyRankedByAll = false
            }
        }
    },
    data() {
        return {
            showOnlyRankedByAll: false,
            showOnlyNotRankedByAll: false,
            profiles: [],
            playerRatings: [],
            games: [],
            search: "",
            playerRatingStats: {},
        }
    },
    computed: {
        totalAvarage: function() {
            if (this.ratings.length <= 0) {
                return 0
            }
            return this.ratings.map(r => r.averageRating).reduce((prev, next) => {
                return prev + next
            }) / this.ratings.length
        },
        chartData: function() {
            let ratings = this.ratings.map(a => a).sort((a, b) => a.averageRating - b.averageRating)
            let data = {
                labels: ratings.map(r => r.name),
                datasets: [
                    {
                        label: 'Durchschnittsbewertung',
                        backgroundColor: '#0077aa',
                        data: ratings.map(r => r.averageRating)
                    }
                ],
            }
            return data
        },
        varianceChart: function() {
            let ratings = this.ratings.map(a => a).sort((a, b) => a.variance - b.variance)
            let data = {
                labels: ratings.map(r => r.name),
                datasets: [
                    {
                        label: 'Abweichung',
                        backgroundColor: '#0077aa',
                        data: ratings.map(r => r.variance)
                    }
                ],
            }
            return data
        },
        groupedRatingChartData: function() {
            let groups = Array.from({length: 11}, () => 0)
            this.ratings.forEach(rating => {
                groups[Math.round(rating.averageRating)]++
            })
            let data = {
                labels: Array.from({length: 10}, (_, i) => i + 1),
                datasets: [
                    {
                        label: 'Spiele',
                        backgroundColor: '#0077aa',
                        data: groups.splice(1,10)
                    }
                ],
            }
            return data
        },
        ratings: function() {
            let ratings = []
            if (this.showOnlyRankedByAll && this.showOnlyNotRankedByAll) {
                return []
            }
            this.games.forEach(game => {
                var gameRatings = []
                let playerRatings = this.playerRatings.filter(
                    playerRating => playerRating.objectId === game.objectId
                )
                if (this.showOnlyRankedByAll && playerRatings.length < this.profiles.length) {
                    return
                }
                if (this.showOnlyNotRankedByAll && playerRatings.length >= this.profiles.length) {
                    return
                }

                playerRatings.forEach(playerRating => {
                    gameRatings.push(playerRating.rating)
                    this.playerRatingStats[game.objectId + playerRating.username] = {
                        rating: playerRating.rating,
                        isMin: (_.minBy(playerRatings, r => r.rating).rating === playerRating.rating),
                        isMax: (_.maxBy(playerRatings, r => r.rating).rating === playerRating.rating)
                    }
                    game[playerRating.username] = playerRating.rating
                })
                if (gameRatings.length > 0) {
                    game.averageRating = gameRatings.reduce((a, b) => a + b, 0) / gameRatings.length
                    game.highestDifference = Math.max(...gameRatings) - Math.min(...gameRatings)
                    // Standardabweichung
                    let total = 0
                    for (let i = 0; i < gameRatings.length; i++) {
                        total += Math.pow(gameRatings[i] - game.averageRating, 2)
                    }
                    game.variance = Math.sqrt(total / gameRatings.length)
                }
                ratings.push(game)
            })
            ratings.forEach(rating => {
                // Setze Platz
                rating.rank = ratings.filter(cmp => cmp.averageRating > rating.averageRating).length + 1
            })
            return ratings
        },
        headers: function() {
            let header = [
                { name: 'rank', text: 'Platz', value: 'rank', align: 'end' },
                { name: 'RankBGG', text: 'Platz BBG', value: 'rankBGG', align: 'end' },
                { name: 'name', text: 'Spiel', value: 'name' },
                { name: 'averageRating', text: 'Ø', value: 'averageRating'},
                { name: 'averageRatingBGG', text: 'Ø BBG', value: 'averageRatingBGG'},
                { name: 'highestDifference', text: 'größte Abweichung', value: 'highestDifference'},
                { name: 'variance', text: 'Varianz', value: 'variance'},
            ]
            this.profiles.forEach(profile => {
                header.push({
                    value: profile,
                    text: profile,
                    align: 'center'
                })
            })
            return header;
        }
    },
    methods: {
        toDecimal: function(number) {
            return (Math.round(number * 100) / 100).toString().replace(".", ",")
        },
        addNewProfile: function(username) {
            this.profiles.push(username)
            axios
                .get(`https://api.geekdo.com/xmlapi2/collection?username=${username}&rated=1&stats=1`)
                .then(response => {
                    let collection = JSON.parse(xmljs.xml2json(response.data, {compact: true}))
                    if (!collection.items.item) {
                        return
                    }
                    collection.items.item.forEach(item => {
                        this.playerRatings.push({
                            username: username,
                            objectId: item._attributes.objectid,
                            rating: parseFloat(item.stats.rating._attributes.value)
                        })
                    })
                })
        },
        setCollection: function(id) {
            this.games = []
            axios
                .get(`https://boardgamegeek.com/xmlapi2/geeklist/${id}`)
                .then(response => {
                    let collection = JSON.parse(xmljs.xml2json(response.data, {compact: true}))
                    collection.geeklist.item.forEach(item => {
                        this.games.push({
                            objectId: item._attributes.objectid,
                            name: item._attributes.objectname,
                            url: 'https://boardgamegeek.com/boardgame/' + item._attributes.objectid,
                            rankBGG: 'TBA',
                            averageRatingBGG: 'TBA',
                        })
                    })
                })
        }
    }
}
</script>

<style>
tbody tr:nth-of-type(odd) {
  background-color: rgb(45, 45, 45);
}
tbody tr:hover {
    background-color: rgb(60, 60, 60) !important;
}
</style>