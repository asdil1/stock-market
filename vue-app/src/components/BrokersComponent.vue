<template>
  <div class="brokers-container">
    <h2 class="stock-title">Список брокеров</h2>
    <ul class="broker-list">
      <li v-for="broker in brokersData" :key="broker.id" class="stock-item">
        <div class="broker-info">
          <h3 class="broker-name">{{ broker.name }}</h3>
          <span>Баланс брокера: {{ broker.funds.toFixed(2) }}</span>
          <p
              class="broker-profit"
              :class="{
                'profit-positive': getProfit(broker.id) > 0,
                'profit-negative': getProfit(broker.id) < 0,
              }"
          >
            Общая прибыль: {{ getProfit(broker.id).toFixed(2) }}$
          </p>
        </div>
        <ul v-if="broker.stocks.length > 0" class="stock-list">
            <li v-for="stock in broker.stocks" :key="stock.symbol" class="stock-item">
              <div class="stock-info">
                <span class="stock-symbol">{{ stock.symbol }}</span>
                <span class="stock-price">{{ formatPrice(stock.price) }} $</span>
                <span class="stock-price">Количество: {{stock.quantity }}</span>
                <span class="broker-profit"
                  :class="{
                  'profit-positive': getProfitForStock(stock, broker) > 0,
                  'profit-negative': getProfitForStock(stock, broker) < 0,
                }">
                  Прибыль: {{ getProfitForStock(stock, broker).toFixed(2) }}$
                </span>
              </div>
            </li>
        </ul>
        <p v-else>Брокер не купил акций</p>
      </li>
    </ul>
  </div>
</template>

<script>
import {io} from "socket.io-client";
import { mapGetters } from "vuex";

export default {
  name: "BrokersComponent",
  props: {
    mainBrokers: {
      type: Array,
      required: true
    }
  },

  data(){
    return {
      brokersData: [],
      socket: null,
      profits: [],
      profitForStocks: [],
    }
  },

  watch:{
    mainBrokers: {
      handler(newVal){
        this.brokersData = [...newVal];
      },
      deep: true, // Следим за глубокими изменениями (например, внутри объектов)
      immediate: true, // Вызываем сразу при загрузке компонента
    }
  },

  computed: {
    ...mapGetters(["currentBroker"])
  },

  created() {
    this.brokersData = [...this.mainBrokers];
  },

  mounted() {
    this.connectSocket();
  },

  beforeUnmount() {
    if(this.socket) {
      this.socket.disconnect();
    }
  },

  methods: {
    getProfit(brokerId){
      const brokerProfit = this.profits.find(profit => profit.id === brokerId);
      return brokerProfit ? brokerProfit.profit : 0;
    },

    getProfitForStock(stockForProfit, broker){
      const currStockProfit = this.profitForStocks.find(stock => stockForProfit.symbol === stock.symbol && stock.id === broker.id);
      return currStockProfit ? currStockProfit.stockProfit : 0; // тернарный
    },

    formatPrice(price){
      return parseFloat(price).toFixed(2);
    },

    connectSocket() {
      this.socket = io("http://localhost:3000");

      this.socket.on('priceUpdate', (data) => {
        this.updateBrokersProfit(data.prices);
      });
    },

    updateBrokersProfit(updatedPrices) {
      // Перебираем всех брокеров
      this.brokersData.forEach((broker) => {
        let totalProfit = 0;

        // Перебираем акции брокера
        broker.stocks.forEach((stock) => {
          const updatedStock = updatedPrices.find(
              (stockUpdated) => stockUpdated.symbol === stock.symbol
          );

          if (updatedStock){
            // Рассчитываем прибыль/убыток
            const profit = (updatedStock.price - stock.price) * stock.quantity;

            const stockProfit = this.profitForStocks.find(stock => stock.symbol === updatedStock.symbol && broker.id === stock.id);
            if(stockProfit){
              stockProfit.stockProfit = profit;
            } else {
              this.profitForStocks.push({ id: broker.id, symbol: updatedStock.symbol, stockProfit: profit });
            }

            totalProfit += profit;
          }
        });

        // Обновляем или добавляем прибыль брокера в массив profits
        const brokerProfit = this.profits.find(profit => profit.id === broker.id);
        if (brokerProfit) {
          brokerProfit.profit = totalProfit;
        } else {
          this.profits.push({ id: broker.id, profit: totalProfit });
        }
      });
    },
  }
}
</script>

<style scoped>
.brokers-container {
  margin: 20px auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 800px;
}

.broker-list {
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

.profit-positive {
  color: green;
}

.profit-negative {
  color: red;
}
</style>