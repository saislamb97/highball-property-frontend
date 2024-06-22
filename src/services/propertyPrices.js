import { useIsFetching, useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import useToast from "src/hooks/useToast";
import axiosInstance from "src/utils/axiosInstance";

const url = '/api/property/prices';

export function usePriceAvailableStatus() {
  const query = useQuery({
    queryKey: ['property/prices/available_status'],
    queryFn: () => axiosInstance.get(`${url}/available_status`)
  })
  
  return query
}

export function useStatusCount() {
  const query = useQuery({
    queryKey: ['status_count'],
    queryFn: async () => {
      const statuses = ['AVAILABLE', 'OCCUPIED', 'NOT_AVAILABLE'];
      const requests = statuses.map(status =>
        axiosInstance.get('/api/property/prices/status_count', {
          params: { available_status: status }
        }).then(response => {
          const totalCount = response.reduce((acc, curr) => acc + curr.count, 0);
          return { status, totalCount, data: response };
        }).catch(error => {
          console.error(`Error fetching data for status: ${status}`, error);
          return { status, totalCount: 0, data: [] };
        })
      );

      const responseData = await Promise.all(requests);
      const totalCounts = responseData.reduce((acc, curr) => {
        acc[curr.status] = curr.totalCount;
        return acc;
      }, {});

      return { totalCounts, data: responseData };
    }
  });

  return query;
}

export function usePricesByDateRange({ property_id, dateRange, available_status }, options = {}) {
  const queryKey = ['property/prices', property_id, dateRange, available_status];
  const query = useQuery({
    queryKey,
    queryFn: () => axiosInstance.get(url, { 
      params: {
        property_id: property_id,
        dateStart: dateRange[0],
        dateEnd: dateRange[1],
        ...(available_status ? { available_status } : {}),
      }
    }),
    enabled: Boolean(property_id && dateRange.length),
    ...options
  });

  const isFetching = useIsFetching({ queryKey });

  return {
    ...query,
    queryKey,
    isFetching
  };
}

export function useFormSubmit(options) {
  const mutation = useMutation({
    mutationFn: ({ ...params }) => {
      if (params.hasOwnProperty('price')) {
        return axiosInstance.post(url, {
          ...params,
        })
      }
    }
  })
  
  const toast = useToast()
  let onSuccess = e => toast('success', 1)
  let onError = e => toast(mutation.error?.message || 'request failed')

  if (options) {
    onSuccess = options.onSuccess || (e => null)
    onError = options.onError || (e => null)
  }

  useEffect(() => {
    if (mutation.isError) {
      onError()
    }
    if (mutation.isSuccess) {
      onSuccess()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isError, mutation.isSuccess])

  return mutation
}