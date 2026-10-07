import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../shared/api/http";

/** Cliente de TanStack Query: cómo se cachean y reintentan las llamadas a la API. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      // Un 401 o 404 no se reintenta; un corte de red sí, una vez.
      retry: (intentos, error) => !(error instanceof ApiError && error.status > 0) && intentos < 1
    }
  }
});
