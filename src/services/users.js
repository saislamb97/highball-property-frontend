import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axiosInstance from "src/utils/axiosInstance";

const url = '/api/users';

export function DeleteFeedback(id) {
  if (!+id) return Promise.reject({ message: 'missing field: id' })
  return axiosInstance.delete(`${url}/${id}`)
}

export function useUsers({ role, gender, searchKeyword }) {
  const [paginate, setPaginate] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    pageCount: 1
  })

  const query = useQuery({
    queryKey: ['users', role, gender, paginate.page, searchKeyword],
    queryFn: () => {
      const { page, pageSize } = paginate;
      const useTypes = {}
      if (role) {
        useTypes.role = role
      }
      if (gender) {
        useTypes.gender = gender
      }
      const useKeyword = searchKeyword ? { keyword: searchKeyword } : {};
      return axiosInstance.get(url, { params: { ...useTypes, ...useKeyword, page, pageSize } })
    }
  })

  return {
    ...query,
    paginate,
    setPaginate,
  }
}

export function useCount() {
  const query = useQuery({
    queryKey: [`users_count`],
    queryFn: _ => {
      return axiosInstance.get(url + '/count')
    },
  })

  return query
}

export function useFormSubmit({ onSuccess, onError }) {
  const mutation = useMutation({
    mutationFn: ({ id, ...formData }) => {
      if (id) {
        return axiosInstance.put(url + '/' + id, formData )
      }
      return axiosInstance.post('/api/users/register', formData)
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