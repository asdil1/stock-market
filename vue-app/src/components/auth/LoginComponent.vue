<template>
  <div class="login">
    <div class="login-card">
      <h2>Вход в приложение</h2>
      <form @submit.prevent="handleSubmit">
        <label for="existing-names">Выберите имя:</label>
        <select v-model="selectedName" id="existing-names">
          <option disabled value="">Выберите имя</option>
          <option v-for="name in brokerNames" :key="name" :value="name">
            {{name}}
          </option>
        </select>
        <button type="submit" :disabled="!selectedName" class="login-button">
          Войти
        </button>
      </form>
      <div class="register-container">
        <button class="register" @click="goToRegister">
          Зарегестрироватья
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "LoginComponent",
  data(){
    return {
      brokerNames: [],
      selectedName: '',
      brokerData: null
    };
  },
  created() {
    this.fetchBrokerNames()
  },

  methods: {
    ...mapActions(["login"]),

    fetchBrokerNames() {
      fetch("http://localhost:3000/brokers")
          .then(res => res.json())
          .then(data => this.setBrokers(data))
          .catch(error => console.log(error));
    },

    setBrokers(brokers) {
      this.brokerNames = brokers.map((broker) => broker.name);
      this.brokersData = brokers;
    },

    handleSubmit(){
      const broker = this.brokersData.find((broker) => broker.name === this.selectedName);
      console.log(broker);
      this.login({ id: broker.id, name: this.selectedName, funds: broker.funds, stocks: broker.stocks});
      this.$router.push('/main');
    },

    goToRegister(){
      this.$router.push("/register");
    }
  }
};
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  background: white;
  padding: 20px 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  text-align: left;
  width: 350px;
}

label {
  margin-bottom: 10px;
  font-weight: bold;
  color: #555;
}

select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  outline: none;
}

select:focus {
  border-color: #007bff;
}

.login-button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  font-size: 16px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.register-container{
  text-align: center;
}

.register{
  margin-top: 10px;
  font-size: 15px;
  color: #007bff;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.register:hover{
  color: #0056b3;
}

</style>
