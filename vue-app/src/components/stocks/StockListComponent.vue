<template>
  <div class="stock-container">
    <h2 class="stock-title">Доступные акции</h2>
    <ul class="stock-list">
      <li v-for="stock in stocks" :key="stock.symbol" class="stock-item">
        <div class="stock-info">
          <span class="stock-symbol">{{ stock.symbol }}</span>
          <span class="stock-name">{{ stock.name }}</span>
          <span class="stock-date">{{ stock.date }}</span>
          <span class="stock-price">{{ formatPrice(stock.price) }} $</span>
        </div>
        <div class="stock-actions">
          <button @click="buyStock(stock)">Купить</button>
          <button @click="sellStock(stock)">Продать</button>
          <button @click="viewGraph(stock)">График</button>
        </div>
      </li>
    </ul>

    <ModalComponent
      v-if="selectedStock && isModalVisible"
      :title="modalTitle"
      :stock="selectedStock"
      :historicalData="historicalData"
      :isVisible="isModalVisible"
      @close="closeModal"
    />
  </div>
</template>

<script>
import ModalComponent from "@/components/stocks/ModalComponent.vue";
import {io} from "socket.io-client";

export default {
  name: "StockListComponent",

  components: { ModalComponent },

  props:{
    mainStocks: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      stocks: [],
      selectedStock: null,
      isModalVisible: false,
      modalTitle: "",
      socket: null,
      historicalData: []
    };
  },

  created() {
    this.fetchAllInfoStocks();
  },

  mounted() {
    this.connectSocket();
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },

  methods: {
    fetchAllInfoStocks(){
      console.log(this.stocks);

      fetch("http://localhost:3000/stocks/symbols")
          .then(res => res.json())
          .then(data => {

            this.historicalData = data;

            this.mainStocks.forEach(stock => {
              const dataSymbol = data.filter((dataStock) => stock.symbol === dataStock.symbol)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

              const newStock = {
                symbol: stock.symbol,
                name: stock.name,
                date: dataSymbol.date,
                price: dataSymbol.price,
              }

              this.stocks.push(newStock);
            });
          })
          .catch(error => console.log(error));
    },

    connectSocket() {
      this.socket = io("http://localhost:3000");

      this.socket.on('priceUpdate', (data) => {
        console.log(data.prices);

        this.updateHistoricalData(data.prices);

        const updatedStocks = data.prices;

        updatedStocks.forEach((updatedStock) => {
          // Найти индекс акции по символу
          const stockIndex = this.stocks.findIndex(stock => stock.symbol === updatedStock.symbol);
          if (stockIndex !== -1) {
            // Обновить данные акции
            let currentStock = this.stocks[stockIndex];
            currentStock.date = updatedStock.date;
            currentStock.price = updatedStock.price;
          } else {
            console.log(`Stock not found: ${updatedStock.symbol}`);
          }
        });
      });
    },
    updateHistoricalData(data){
      this.historicalData = [...this.historicalData, ...data];
    },

    formatPrice(price){
      return parseFloat(price).toFixed(2);
    },

    buyStock(stock) {
      this.modalTitle = "Покупка"
      this.selectedStock = stock;
      this.isModalVisible = true;
    },

    sellStock(stock) {
      this.modalTitle = "Продажа"
      this.selectedStock = stock;
      this.isModalVisible = true;
    },

    viewGraph(stock) {
      this.modalTitle = "История"
      this.selectedStock = stock;
      this.isModalVisible = true;
    },

    closeModal(){
      this.modalTitle = "";
      this.selectedStock = null;
      this.isModalVisible = false;
    },
  }
}
</script>

<style scoped>

.stock-container {
  margin: 20px auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 800px;
}

.stock-title {
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20px;
  text-align: center;
}

.stock-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.stock-item {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.stock-item:hover {
  background-color: #f9f9f9;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.stock-info {
  display: flex;
  flex-direction: column;
}

.stock-symbol {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
}

.stock-price {
  font-size: 16px;
  color: #666666;
}

.stock-actions button {
  margin-left: 10px;
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.stock-actions button:hover {
  background-color: #0056b3;
}

</style>