import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../api/api";

export function useProducts(params = {}) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params).then((res) => {

      return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
    }),
  });

  return { 
    products: data, 
    loading: isLoading, 
    error: isError ? error : null, 
    refetch 
  };
}
