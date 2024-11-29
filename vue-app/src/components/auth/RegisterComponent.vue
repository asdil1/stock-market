<template>
  <div class="register">
    <div class="register-card">
      <h2>Регистрация</h2>
      <form @submit.prevent="handleSubmit">
        <label for="username">Введите имя:</label>
        <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Введите имя"
            required
        />
        <label for="balance">Введите баланс:</label>
        <input
            id="balance"
            v-model.number="balance"
            type="number"
            placeholder="Введите баланс"
            min="0"
            required
        />
        <button
            type="submit"
            :disabled="!username || balance === null || balance < 0"
            class="register-button"
        >
          Зарегистрироваться
        </button>
      </form>
      <div class="login-container">
        <button class="login-button" @click="goToLogin">
          Войти
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterComponent',
  data(){
    return {
      username: '',
      balance: null,
    };
  },
  methods:{

    goToLogin(){
      this.$router.push('/login');
    },

    handleSubmit(){
      const newBroker = {
        name: this.username,
        funds: this.balance,
        stocks: []
      };

      fetch("http://localhost:3000/brokers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBroker),
      })
          .then(response => response.json())
          .then(data => console.log(data))
          .catch(error => console.log(error));

      alert("Успешная регистрация")
      this.goToLogin();
    }
  }
}
</script>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.register-card {
  background: white;
  padding: 20px 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  text-align: left;
  width: 350px;
}

h2 {
  margin-bottom: 20px;
}

label {
  text-align: left;
  margin-bottom: 8px;
  font-size: 14px;
}
input {
  width: 95%;
  padding: 8px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}
.register-button {
  display: block;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}
.register-button {
  background-color: #28a745;
}
.register-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-container{
  text-align: center;
}

.login-button {
  margin-top: 10px;
  font-size: 15px;
  color: #007bff;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.login-button:hover{
  color: #0056b3;
}

</style>