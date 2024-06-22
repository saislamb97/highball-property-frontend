import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axiosInstance from "src/utils/axiosInstance";

const url = '/api/payments';

export function GetPayments(params = {}) {
  return axiosInstance.get(url, {
    params
  })
}

export function usePayments({ payment_status, searchKeyword = '' }) {
  const [paginate, setPaginate] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pageCount: 1
  });

  const query = useQuery({
    queryKey: ['payments', payment_status, searchKeyword, paginate.page],
    queryFn: () => {
      const { page, pageSize } = paginate;
      const useTypes = {}
      if (payment_status) {
        useTypes.payment_status = payment_status
      }
      const useKeyword = searchKeyword ? { search: searchKeyword } : {}
      return axiosInstance.get(url, { params: { ...useTypes, ...useKeyword, page, pageSize } })
    }
  });

  return {
    ...query,
    paginate,
    setPaginate,
  }
}

export function usePayment({ id }, options = {}) {
  const query = useQuery({
    queryKey: [`payment`, id],
    queryFn: _ => {
      return axiosInstance.get(url + '/' + id)
    },
    enabled: !!+id,
    ...options
  })

  return query
}

export function useFormSubmit({ onSuccess, onError }) {
  const mutation = useMutation({
    mutationFn: ({ id, ...formData }) => {
      if (id) {
        return axiosInstance.put(url + '/' + id, formData)
      }
      return axiosInstance.post(url, formData)
    }
  })

  useEffect(() => {
    if (mutation.isError) {
      onError()
    }
    if (mutation.isSuccess) {
      onSuccess()
    }
  }, [mutation.isError, mutation.isSuccess])

  return mutation
}
