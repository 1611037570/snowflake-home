import { ref } from "vue";

export const routeLoading = ref(false);

export const startRouteLoading = () => {
  routeLoading.value = true;
};

export const stopRouteLoading = () => {
  routeLoading.value = false;
};
