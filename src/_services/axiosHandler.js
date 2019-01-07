import axios from 'axios'
import { store } from '../_store/index.js';

//Default handler for Unauthorized Access to API
axios.interceptors.response.use(null, function(error) {
  if (error.response.status === 401) {
    //Dispatch logout
    store.dispatch('authentication/logout')
    return "Unauthorized access";
  }
  return Promise.reject(error);
});
