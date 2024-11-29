import {createStore} from 'vuex';


const store = createStore({
    state: {
        broker: JSON.parse(sessionStorage.getItem('broker')) || {
            id: null,
            name: null,
            funds: null,
            stocks: [],
        },
    },
    mutations: {
        SET_BROKER(state, broker) {
            state.broker = broker;
            sessionStorage.setItem(`broker`, JSON.stringify(broker));
        },
        CLEAR_BROKER(state) {
            sessionStorage.removeItem(`broker`); // Удаляем данные из sessionStorage
            state.broker = { id: null, name: null, funds: null, stocks: [] }; // Очищаем состояние
        },
        UPDATE_BROKER(state, newBroker) {
            if(state.broker.id === newBroker.id) {
                state.broker = newBroker;
                sessionStorage.setItem(`broker`, JSON.stringify(newBroker));
            }
        }
    },
    actions: {
        // деструктуризация commit чтоб не писать context.commit
        login({ commit }, broker) {
            commit('SET_BROKER', broker);
        },
        logout({ commit }) {
            commit('CLEAR_BROKER'); // Логика выхода
        },
        updateBroker({ commit }, broker) {
            commit('UPDATE_BROKER', broker);
        }
    },

    getters: {
        currentBroker: state => state.broker,
    }
})

export default store;