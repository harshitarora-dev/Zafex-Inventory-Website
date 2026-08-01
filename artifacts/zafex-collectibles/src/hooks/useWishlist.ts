import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlist, addToWishlist, removeFromWishlist } from '@/lib/api';

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useIsInWishlist(productId: string) {
  const { data } = useWishlist();
  return data?.items.some((item) => item.productId === productId) ?? false;
}

export function useWishlistItem(productId: string) {
  const { data } = useWishlist();
  return data?.items.find((item) => item.productId === productId) ?? null;
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => addToWishlist({ productId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeFromWishlist(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}
