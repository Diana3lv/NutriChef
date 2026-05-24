import { Routes } from '@angular/router';

import { MainLayout } from './layouts/main-layout/main-layout';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Onboarding } from './components/onboarding/onboarding';
import { Profile } from './components/profile/profile';
import { Inventory } from './components/inventory/inventory';
import { RecipeDetail } from './components/recipe-detail/recipe-detail';
import { AdminIngredients } from './components/admin/admin-ingredients/admin-ingredients';
import { AdminRecipeManagement } from './components/admin/admin-recipe-management/admin-recipe-management';
import { AdminUsersComponent } from './components/admin/admin-users/admin-users';
import { RecipeCollection } from './components/recipe-collection/recipe-collection';
import { RecipeBrowse } from './components/recipe-browse/recipe-browse';
import { ShoppingListComponent } from './components/shopping-list/shopping-list';
import { RecipeInProgress } from './components/recipe-in-progress/recipe-in-progress';

import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { onboardingGuard } from './guards/onboarding-guard';
import { adminGuard } from './guards/admin-guard';
import { userGuard } from './guards/user-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'home', component: Home, canActivate: [authGuard] },
      { path: 'profile', component: Profile, canActivate: [userGuard] },
      { path: 'inventory', component: Inventory, canActivate: [userGuard] },
      { path: 'recipes/breakfast',  component: RecipeBrowse, data: { tag: 'BREAKFAST'  }, canActivate: [authGuard] },
      { path: 'recipes/lunch',      component: RecipeBrowse, data: { tag: 'LUNCH'      }, canActivate: [authGuard] },
      { path: 'recipes/dinner',     component: RecipeBrowse, data: { tag: 'DINNER'     }, canActivate: [authGuard] },
      { path: 'recipes/dessert',    component: RecipeBrowse, data: { tag: 'DESSERT'    }, canActivate: [authGuard] },
      { path: 'recipes/drinks',     component: RecipeBrowse, data: { tag: 'DRINK'      }, canActivate: [authGuard] },
      { path: 'recipes/quick-easy', component: RecipeBrowse, data: { tag: 'QUICK_EASY' }, canActivate: [authGuard] },
      { path: 'recipes/baking',     component: RecipeBrowse, data: { tag: 'BAKING'     }, canActivate: [authGuard] },
      { path: 'recipes/:id',        component: RecipeDetail, canActivate: [authGuard] },
      { path: 'cuisine/:tag',  component: RecipeBrowse, canActivate: [authGuard] },
      { path: 'popular/:tag',  component: RecipeBrowse, canActivate: [authGuard] },
      { path: 'seasonal/:tag', component: RecipeBrowse, canActivate: [authGuard] },
    ]
  },
  { path: 'admin/recipes', component: AdminRecipeManagement, canActivate: [adminGuard] },
  { path: 'admin/ingredients', component: AdminIngredients, canActivate: [adminGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'favorites', component: RecipeCollection, data: { collectionType: 'FAVORITE' }, canActivate: [authGuard] },
      { path: 'done-recipes', component: RecipeCollection, data: { collectionType: 'DONE' }, canActivate: [authGuard] },
      { path: 'shopping-list', component: ShoppingListComponent, canActivate: [authGuard] },
      { path: 'recipes-in-progress', component: RecipeInProgress, canActivate: [authGuard] },
    ]
  },
  { 
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  { 
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: 'onboarding',
    component: Onboarding,
    canActivate: [onboardingGuard]
  },
  { path: '**', redirectTo: 'home' }
];
