import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import useToast from "src/hooks/useToast";
import axiosInstance from "src/utils/axiosInstance";

const url = '/api/bookings/'

export function useBookings(options = {}) {
  const { booking_status = '', check_in_status = '', searchKeyword = '' } = options
  const [paginate, setPaginate] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pageCount: 1
  })

  const query = useQuery({
    queryKey: ['bookings', booking_status, check_in_status, paginate.page, searchKeyword],
    queryFn: () => {
      const { page, pageSize } = paginate;
      const useTypes = {}
      if (booking_status) {
        useTypes.booking_status = booking_status
      }
      if (check_in_status) {
        useTypes.check_in_status = check_in_status
      }
      const useKeyword = searchKeyword ? { keyword: searchKeyword } : {};
      return axiosInstance.get('/api/bookings', { params: { ...useTypes, ...useKeyword, page, pageSize } })
    }
  })

  return {
    ...query,
    paginate,
    setPaginate,
  }
}

export function useCount({ booking_status, check_in_status }) {
  const query = useQuery({
    queryKey: [`bookings_count`, booking_status, check_in_status],
    queryFn: _ => {
      return axiosInstance.get('/api/bookings/count', {
        params: {
          ...(booking_status ? { booking_status } : {}),
          ...(check_in_status ? { check_in_status } : {}),
        }
      })
    },
  })

  return query
}

export function useFormSubmit(options) {
  const mutation = useMutation({
    mutationFn: ({ id, ...formData }) => {
      if (id) {
        return axiosInstance.put('/api/bookings/' + id, { id, ...formData })
      }
      return axiosInstance.post('/api/bookings', formData)
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
  }, [mutation.isError, mutation.isSuccess])

  return mutation
}