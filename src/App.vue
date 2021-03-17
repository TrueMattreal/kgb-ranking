<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
    </v-app-bar>

    <v-main>
      <ranking-table/>
    </v-main>
  </v-app>
</template>

<script>
import RankingTable from './components/RankingTable.vue';

export default {
  name: 'App',

  components: {
    RankingTable,
  },

  data: () => ({
    //
  }),
};
</script>
