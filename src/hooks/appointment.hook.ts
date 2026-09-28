import { bookAppointment, getMyAppointments } from "@/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useBookAppointment() {
  return useMutation({
    mutationFn: bookAppointment,
  });
}

export function useGetMyAppointments(params: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["appointments", params.page ?? 1, params.limit ?? 100],
    queryFn: () => getMyAppointments(params),
  });
}