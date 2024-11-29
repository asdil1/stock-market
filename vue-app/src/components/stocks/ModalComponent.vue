<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <h3>{{ title }} акции: {{ stock.symbol }}</h3>
      <p>Название: {{ stock.name }}</p>
      <p>Цена: {{ stock.price }} $</p>

      <div v-if="isPurchaseOrSale">
        <p>Имя брокера: {{ broker.name }}</p>
        <p>Баланс брокера: {{ broker.funds.toFixed(2) }} $</p>
        <div v-if="broker.stocks.length !== 0 && title === 'Продажа'">
          <div v-for="brokerStock in broker.stocks" :key="brokerStock.symbol">
            <div v-if="stock.symbol === brokerStock.symbol">
              <p>Доступно для продажи: {{ brokerStock.quantity }}</p>
            </div>
            <p></p>
          </div>
        </div>

        <input
            type="number"
            v-model.number="quantity"
            min="1"
            placeholder="Количество акций"
        />

        <p>Итоговая стоимость: {{ totalCost.toFixed(2) }} $</p>
        <p v-if="insufficientFunds" class="error">
          Недостаточно средств для покупки!
        </p>
        <p v-if="insufficientStocks" class="error">
          Недостаточно акций для продажи!
        </p>
      </div>
      <div v-if="!isPurchaseOrSale">
        <ChartComponent
          :historicalData="historicalData"
          :selectedStock="stock"
        />
      </div>
      <div class="modal-actions">
        <button
            class="confirm-button"
            @click="confirmAction"
            :disabled="insufficientFunds || quantity <= 0 || insufficientStocks"
            v-if="isPurchaseOrSale">
          Подтвердить
        </button>
        <button @click="close">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ChartComponent from "@/components/stocks/ChartComponent.vue";

export default {
  name: "ModalComponent",
  components: { ChartComponent },
  props: {
    title: {
      type: String,
      required: ""
    },
    stock: {
      type: Object,
      required: true,
    },
    isVisible: {
      type: Boolean,
      required: true,
    },
    historicalData:{
      type: Array,
      required: true,
    }
  },

  data(){
    return {
      quantity: 0
    };
  },

  computed: {
    ...mapGetters(["currentBroker"]),

    broker() {
      return this.currentBroker;
    },

    isPurchaseOrSale() {
      return this.title === "Покупка" || this.title === "Продажа";
    },

    totalCost(){
      return this.stock.price * this.quantity;
    },

    insufficientFunds(){
      return this.totalCost > this.broker.funds && this.title === "Покупка";
    },

    insufficientStocks() {
      if (this.title !== "Продажа") return false;

      const existingStock = this.broker.stocks.find(
          (stock) => stock.symbol === this.stock.symbol
      );
      return !existingStock || this.quantity > existingStock.quantity;
    },
  },

  methods: {
    ...mapActions(["updateBroker"]),

    confirmAction(){
      if(this.title === "Покупка"){
        this.confirmPurchase();
      } else {
        this.confirmSale();
      }
    },

    confirmSale(){
      const existingStockIndex = this.broker.stocks.findIndex(
          stock => stock.symbol === this.stock.symbol
      );

      if(existingStockIndex !== -1){
        const exisingStock = this.broker.stocks[existingStockIndex];
        const updatedStocks = [...this.broker.stocks];

        if(this.quantity === exisingStock.quantity){
          updatedStocks.splice(existingStockIndex, 1);
        } else {
          exisingStock.quantity -= this.quantity;
        }

        const updatedBroker = {
          id: this.broker.id,
          name: this.broker.name,
          funds: this.broker.funds + this.totalCost,
          stocks: updatedStocks
        }

        fetch(`http://localhost:3000/brokers/buy/${this.broker.id}`, {
          method: "PUT",
          body: JSON.stringify(updatedBroker),
          headers: {
            "Content-Type": "application/json"
          }
        })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(error => console.log(error));

        this.updateBroker(updatedBroker);
      }
    },

    confirmPurchase() {
      const updatedBroker = {
        id: this.broker.id,
        name: this.broker.name,
        funds: this.broker.funds - this.totalCost,
        stocks: [...this.broker.stocks]
      }

      const exisingStockIndex = this.broker.stocks.findIndex(
          stock => stock.symbol === this.stock.symbol
      );

      if(exisingStockIndex !== -1){
        const existingStock = this.broker.stocks[exisingStockIndex];

        // Вычисляем новую среднюю цену
        const totalQuantity = existingStock.quantity + this.quantity;
        const totalCost = existingStock.price * existingStock.quantity + this.stock.price * this.quantity;
        const newAveragePrice = totalCost / totalQuantity;

        existingStock.quantity = totalQuantity;
        existingStock.price = newAveragePrice;
      } else {
        updatedBroker.stocks.push({
          symbol: this.stock.symbol,
          quantity: this.quantity,
          price: this.stock.price
        });
      }
      console.log(updatedBroker);

      fetch(`http://localhost:3000/brokers/buy/${this.broker.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedBroker),
        headers: {
          "Content-Type": "application/json"
        }
      })
          .then(res => res.json())
          .then(data => console.log(data))
          .catch(error => console.log(error));

      this.updateBroker(updatedBroker);
    },

    close() {
      this.$emit("close");
    },
  }
}
</script>


<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.modal-actions button {
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.modal-actions button:hover:not(:disabled) {
  background-color: #0056b3;
}

input {
  width: 40%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.error {
  color: red;
  font-weight: bold;
}
</style>