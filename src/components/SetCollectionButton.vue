<template>
    <v-dialog
        v-model="dialog"
        max-width="500px"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
            >
            Liste setzen
            </v-btn>
        </template>
        <v-card>
            <v-card-title>
            <span class="headline">Liste setzen</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col
                            cols="12"
                        >
                            <v-text-field
                            v-model="collectionId"
                            label="Listenname"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="close"
                >
                    Abbrechen
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    dark
                    @click="setCollection"
                >
                    Setzen
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data: () => ({
        dialog: false,
        collectionId: '283494',
    }),
    methods: {
        close() {
           this.dialog = false
           this.collectionId = '283494'
        },
        setCollection() {
            this.$emit('setCollection', this.collectionId.toString())
            this.close()
        }
    }
}
</script>