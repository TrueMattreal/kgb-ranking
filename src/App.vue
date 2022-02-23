<template>
  <v-app>
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
  mounted() {
    document.title = "KGB Rating - Die Meinung vom Klub der Gesellschafts- und Brettspiele"
  }
};
</script>
