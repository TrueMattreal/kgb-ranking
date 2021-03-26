<template>
    <v-container>
    
        <v-row>
            <v-col>
                <v-data-table
                    :headers="headers"
                    :items="ratings"
                    :disable-pagination="true"
                    :hide-default-footer="false"
                    :sort-by="['rank', 'name']"
                    class="elevation-1"
                    dense
                >
                    <template v-slot:top>
                        <v-toolbar
                            flat
                        >
                            <v-toolbar-title>Brettspieleranking von {{ games.length }} Spielen</v-toolbar-title>
                            <v-divider
                                class="mx-4"
                                inset
                                vertical
                            ></v-divider>
                            <v-switch
                                v-model="showOnlyRankedByAll"
                                label="Nur Spiele anzeigen, die von allen bewertet wurden"
                                class="mt-5"
                            ></v-switch>
                            <v-spacer></v-spacer>
                            <set-collection-button @setCollection="setCollection"></set-collection-button>
                            <add-profile-button @newProfile="addNewProfile"></add-profile-button>
                        </v-toolbar>
                    </template>
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
                    <template v-slot:items="{ item }">
                        <td>{{ item }}</td>
                    </template>
                    <template v-slot:body.append="{}">
                        <tr>
                            <th class="title"></th>
                            <th class="title"></th>
                            <th class="title">Ø {{ toDecimal(totalAvarage) }}</th>
                            <th class="title"></th>
                            <th class="title"></th>
                            <th v-for="user in profiles" :key="user.name">
                                Ø {{ toDecimal(playerRatings.filter(pr => pr.username === user).reduce((a,b) => a + b.rating, 0) / playerRatings.filter(pr => pr.username === user).length) }}
                            </th>
                        </tr>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h1>gruppierte Durchschnittsbewertung</h1>
                <ratings-grouped-chart :chart-data="grouptedRatingChartData"></ratings-grouped-chart>
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
import SetCollectionButton from './SetCollectionButton.vue'
import AddProfileButton from './AddProfileButton.vue'
import RatingOverviewChart from './RatingOverviewChart.vue'
import RatingsGroupedChart from './RatingsGroupedChart.vue'

export default {
    components: {
        SetCollectionButton,
        AddProfileButton,
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
    data() {
        return {
            showOnlyRankedByAll: false,
            profiles: [],
            playerRatings: [],
            games: [],
        }
    },
    computed: {
        totalAvarage: function() {
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

        grouptedRatingChartData: function() {
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
            this.games.forEach(game => {
                var gameRatings = []
                let playerRatings = this.playerRatings.filter(
                    playerRating => playerRating.objectId === game.objectId
                )
                if (this.showOnlyRankedByAll && playerRatings.length < this.profiles.length) {
                    return
                }

                playerRatings.forEach(playerRating => {
                    gameRatings.push(playerRating.rating)
                    game[playerRating.username] = playerRating.rating
                })
                if (gameRatings.length > 0) {
                    game.averageRating = gameRatings.reduce((a, b) => a + b, 0) / gameRatings.length
                        // deutsches Nummernformat
                        .toString().replace(".", ",")
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
                { name: 'name', text: 'Spiel', value: 'name' },
                { name: 'averageRating', text: 'Durchschnittsbewertung', value: 'averageRating'},
                { name: 'highestDifference', text: 'größte Abweichung', value: 'highestDifference'},
                { name: 'variance', text: 'Standardabweichung', value: 'variance'}
            ]
            this.profiles.forEach(profile => {
                header.push({
                    text: profile,
                    value: profile,
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
                            url: 'https://boardgamegeek.com/boardgame/' + item._attributes.objectid
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