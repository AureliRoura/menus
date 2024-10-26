import { createRouter, createWebHistory } from 'vue-router'
import ControlLogin from '@/modules/ControlLogin'
import arrxios from '@/modules/arrxios.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Inici',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/menu',
      name: 'menu',
      // route level code-splitting
      // this generates a separate chunk (Menu.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ShowMenuView.vue')
    },
    {
      path: '/editcategoriestorecipe',
      name: 'Edita Categories de Receptes',
      component: () => import('../views/EditCategoriesToRecipeView.vue')
    },
    {
      path: '/editingredientstorecipe',
      name: 'Edita Ingredients de Receptes',
      component: () => import('../views/EditIngredientsToRecipeView.vue')
    },
    {
      path: '/menuweek/:menuId',
      name: 'Menu Setmanal',
      component: () => import('../components/ShowWeek.vue')
    },
    {
      path: '/weeklymenu',
      name: 'Weekly Menu',
      // route level code-splitting
      // this generates a separate chunk (WeeklyMenu.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/MenuWeekListView.vue')
    },
    {
      path: '/editingredients',
      name: 'Edita Ingredients',
      component: () => import('../views/EditIngredientsView.vue')
    },
    {
      path: '/editrecipes',
      name: 'Edita Receptes',
      component: () => import('../views/EditRecipesView.vue')
    },
    {
      path: '/recipeIngredients',
      name: 'Llista de Ingredients a Receptes Selecionades',
      component: () => import('../views/RecipeIngredientsView.vue')
    },
    {
      path: '/editday',
      name: 'Edit Day',
      component: () => import('../views/EditDayView.vue')
    },
    {
      path: '/editweek',
      name: 'Edit Week',
      component: () => import('../views/EditWeekView.vue')
    },
    {
      path: '/menuweeklist',
      name: 'Llista de Menús Setmanals',
      component: () => import('../views/MenuWeekListView.vue')
    },
    {
      path: '/showweekview',
      name: 'Mostra Vista Setmanal',
      component: () => import('../views/ShowWeekView.vue')
    },
    {
      path: '/uploadmenu',
      name: 'Carrega des de JSON',
      component: () => import('../views/UploadMenuView.vue')
    },
    {
      path: '/admindata',
      name: 'Adminstració de Components',
      component: () => import('../views/AdminDataView.vue')
      //component: () => import('../components/RenameUnit.vue')
    },
    {
      path: '/login',
      name: "Login",
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/changepassword',
      name: "Canvia Contrasenya",
      component: () => import('../views/ChangePasswordView.vue')
    },
    {
      path: '/newuser',
      name: "Nou Usuari",
      component: () => import('../components/NewUser.vue')
    },
    {
      path: '/register/:username',
      name: "MFA",
      component: () => import('../components/Register.vue')
    },
    {
      path: '/verifyToken',
      name: "Verifica Token",
      component: () => import('../components/VerifyToken.vue')
    },
    {
      path: '/logout',
      name: "Logout",
      // execute a function to logout
      beforeEnter: (to, from, next) => {
        // use the store to logout
        const controlLoginInstance = ControlLogin();
        controlLoginInstance.logout()
        // redirect to login
        next({ name: 'Login' });
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      // redirect to home
      redirect: { name: 'Inici' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.name === 'Login' || to.name == 'Logout' || to.name === 'Nou Usuari' || to.name === 'MFA') {
    next()
    return
  }
  arrxios.get('/api/checksession')
    .then(response => {
      if (response.status !== 200) {
        next({ name: 'Login' })
      }
      else {
        localStorage.setItem('MenuAuthentication', response.headers.authorization);
        next()
      }
    })
    .catch(error => {
      next({ name: 'Login' })
    })
})

export default router
