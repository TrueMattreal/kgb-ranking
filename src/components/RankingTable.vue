<template>
    <v-container>
        

        <v-row>
            <v-col>
                <v-data-table
                    :headers="headers"
                    :items="ratings"
                    :disable-pagination="true"
                    :hide-default-footer="true"
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
                </v-data-table>
            </v-col>
        </v-row>

                <v-row>
            <v-col>
                <ratings-grouped-chart :chart-data="grouptedRatingChartData"></ratings-grouped-chart>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <rating-overview-chart :chart-data="chartData"></rating-overview-chart>
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
        chartData: function() {
            let ratings = this.ratings.map(a => a).sort((a, b) => a.averageRatingNumber - b.averageRatingNumber)
            let data = {
                labels: ratings.map(r => r.name),
                datasets: [
                    {
                        label: 'Spiele',
                        backgroundColor: '#0077aa',
                        data: ratings.map(r => r.averageRatingNumber)
                    }
                ],
            }
            return data
        },

        grouptedRatingChartData: function() {
            let groups = Array.from({length: 11}, () => 0)
            this.ratings.forEach(rating => {
                groups[Math.round(rating.averageRatingNumber)]++
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
            console.log(data)
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
                    game.averageRatingNumber = gameRatings.reduce((a, b) => a + b, 0) / gameRatings.length
                    game.averageRating = this.toDecimal(gameRatings.reduce((a, b) => a + b, 0) / gameRatings.length)
                        // deutsches Nummernformat
                        .toString().replace(".", ",")
                    game.highestDifference = this.toDecimal(Math.max(...gameRatings) - Math.min(...gameRatings))
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
                { name: 'rank', text: 'Platz', value: 'rank' },
                { name: 'name', text: 'Spiel', value: 'name' },
                { name: 'averageRating', text: 'Durchschnittsbewertung', value: 'averageRating'},
                { name: 'highestDifference', text: 'größte Abweichung', value: 'highestDifference'}
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