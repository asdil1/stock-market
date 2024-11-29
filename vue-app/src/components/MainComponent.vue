<template>
  <div class="main">
    <header class="main-header">
      <div class="header-title">Биржа акций</div>
      <div class="header-actions">
        <button id='actions' @click="currentView = 'stocks'">Акции</button>
        <button @click="currentView = 'brokers'">Брокеры</button>
        <button @click="logoutComp">Выход</button>
      </div>
    </header>
    <main class="main-content">
      <component
          :is="currenViewComponent"
          :mainStocks="stocks"
          :mainBrokers="brokers"
      />
    </main>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import StockListComponent from "@/components/stocks/StockListComponent.vue";
import BrokersComponent from "@/components/BrokersComponent.vue";
import {io} from "socket.io-client";


export default {
  name: 'MainComponent',
  components: {
    StockListComponent,
    BrokersComponent
  },

  data(){
    return {
      currentView: "stocks",
      stocks: [],
      brokers: [],
    };
  },

  created() {
    this.fetchStocks();
    this.fetchBrokers();
  },

  mounted() {
    this.connectSocket();
  },

  beforeUnmount() {
    if(this.socket) {
      this.socket.disconnect();
    }
  },

  computed: {
    currenViewComponent(){
      return this.currentView === "stocks" ? "StockListComponent" : "BrokersComponent";
    }
  },

  methods: {
    ...mapActions(["logout", "updateBroker"]),

    fetchStocks() {
      fetch("http://localhost:3000/stocks")
          .then(res => res.json())
          .then(data => this.stocks = data)
          .catch(error => console.log(error));
    },

    fetchBrokers() {
      fetch("http://localhost:3000/brokers")
          .then(res => res.json())
          .then(data => this.brokers = data)
          .catch(error => console.log(error));
    },

    connectSocket() {
      this.socket = io("http://localhost:3000");

      this.socket.on('brokerUpdate', (data) => {
        console.log(`Сообщение от вебсокета ${data}`);
        this.updateBrokersData(data);
      });
    },

    updateBrokersData(newData){
      this.updateBroker(newData);
      const updatedBrokerIndex = this.brokers.findIndex((broker) => broker.id === newData.id);
      if (updatedBrokerIndex !== -1) {
        this.brokers.splice(updatedBrokerIndex, 1, newData);
      }
    },


    logoutComp() {
      this.logout();
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.main-header {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #ffffff;
  color: white;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e0e0e0;
}


.header-title {
  font-size: 30px;
  font-weight: bold;
  color: #333333;
}

.header-actions button {
  background-color: transparent;
  color: #007bff;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 17px;
  transition: color 0.3s ease;
}

.header-actions button:hover {
  color: #ff5252;
}

</style>