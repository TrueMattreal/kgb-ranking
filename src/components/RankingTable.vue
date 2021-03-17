<template>
    <v-container>
        <v-data-table
            :headers="headers"
            :items="ratings"
            :disable-pagination="true"
            :hide-default-footer="true"
            :sort-by="['averageRating', 'name']"
            :sort-desc="true"
            class="elevation-1"
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
                    <v-spacer></v-spacer>
                    <set-collection-button @setCollection="setCollection"></set-collection-button>
                    <add-profile-button @newProfile="addNewProfile"></add-profile-button>
                </v-toolbar>
            </template>
            <template v-slot:item.name="{ item }">
                <a :href="item.url" >{{item.name}}</a>
            </template>
        </v-data-table>
    </v-container>
</template>

<script>
import axios from 'axios'
import xmljs from 'xml-js'
import SetCollectionButton from './SetCollectionButton.vue'
import AddProfileButton from './AddProfileButton.vue'

export default {
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
    components: {
        SetCollectionButton,
        AddProfileButton,
    },
    data() {
        return {
            profiles: [],
            playerRatings: [],
            games: []
        }
    },
    computed: {
        ratings: function() {
            let ratings = []
            this.games.forEach(game => {
                var gameRatings = []
                this.playerRatings.filter(
                    playerRating => playerRating.objectId === game.objectId
                ).forEach(playerRating => {
                    gameRatings.push(playerRating.rating)
                    game[playerRating.username] = playerRating.rating
                })
                if (gameRatings.length > 0) {
                    game.averageRating = (gameRatings.reduce((a, b) => a + b, 0) / gameRatings.length).toFixed(2)
                }
                ratings.push(game);
            })
            return ratings
        },
        headers: function() {
            let header = [
                { name: 'name', text: 'Spiel', value: 'name' },
                { name: 'averageRating', text: 'Durchschnittsbewertung', value: 'averageRating'}
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
                    console.log(collection)
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