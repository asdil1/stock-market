import { createRouter, createWebHistory } from 'vue-router';
import LoginComponent from "@/components/auth/LoginComponent.vue";
import RegisterComponent from "@/components/auth/RegisterComponent.vue";
import MainComponent from "@/components/MainComponent.vue";

const routes = [
    {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/login',
        name: 'LoginComponent',
        component: LoginComponent,
    },
    {
        path: '/register',
        name: 'RegisterComponent',
        component: RegisterComponent,
    },
    {
        path: '/main',
        name: 'MainComponent',
        component: MainComponent,
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;