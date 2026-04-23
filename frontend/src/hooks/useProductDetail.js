import { useQuery } from "@tanstack/react-query";
import { getProductById } from "../api/api";

export function useProductDetail(id) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id).then((res) => {

      return res.data?.data ? res.data.data : res.data;
    }),
    enabled: !!id,
  });

  return { 
    product: data, 
    loading: isLoading, 
    error: isError ? error : null, 
    refetch 
  };
}
