<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions"/>
  </div>
</template>

<script>

import { Line } from "vue-chartjs";
import { registerables, Chart } from "chart.js";

Chart.register(...registerables);

export default {
  name: "ChartComponent",
  components: {
    Line
  },
  props: {
    historicalData: {
      type: Array,
      required: true,
    },
    selectedStock: {
      type: Object,
      required: true,
    }
  },
  data(){
    return {
      chartWidth: 500,
      chartHeight: 300,
    };
  },

  computed:{
    filteredData() {
      return this.historicalData
          .filter(data => data.symbol === this.selectedStock.symbol)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },

    chartData(){
      const labels = this.filteredData.map(data => data.date);
      const prices = this.filteredData.map(data => parseFloat(data.price));
      return {
        labels,
        datasets: [
          {
            label: "Цена закрытия",
            data: prices,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1,
            fill: true, // Заполняет область под линией
          },
        ],
      };
    },

    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false, // Позволяет графику растягиваться
      };
    },
  },
};

</script>

<style scoped>
.chart-container {
  width: 400px;  /* График займет всю доступную ширину */
  height: 300px; /* Высота графика фиксирована или может быть динамической */
  margin-bottom: 20px;
}
</style>