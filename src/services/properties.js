import axios from 'src/utils/axiosInstance';
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axiosInstance from "src/utils/axiosInstance";

const url = '/api/properties';

export const GetProperties = (payload = {}) => {
  return axios.get(url, { params: payload })
};

export const GetProperty = id => {
  if (!+id) return Promise.reject({ message: 'missing field: id' })
  return axios.get(`${url}/${id}`)
};

export const CreateProperty = (payload = {}) => {
  if (!Object.keys(payload).length) return Promise.reject({ message: 'empty payload' })
  return axios.post(url, payload)
};
export const UpdateProperty = ({ id, ...payload }) => {
  if (!+id) return Promise.reject({ message: 'missing field: { id }' })
  return axios.put(`${url}/${id}`, payload)
};

export const DeleteProperty = id => {
  if (!+id) return Promise.reject({ message: 'missing field: id' })
  return axios.delete(`${url}/${id}`)
};

export function usePropertiesByIds(ids = []) {
  const query = useQuery({
    queryKey: ids.sort(),
    queryFn: () => {
      return GetProperties({ id: JSON.stringify(ids) })
    },
    enabled: ids.length > 0
  })

  return query
}

export function useProperties({
  furnish_type = '', view_type = '',
  owner_id = '', searchKeyword = '',
  ...props
}, options = {}) {
  const [paginate, setPaginate] = useState({
    page: 1,
    pageSize: props.pageSize || 8,
    total: 0,
    pageCount: 1
  })

  const types = { 
    furnish_type, view_type,
    owner_id,
  }

  const query = useQuery({
    queryKey: ['properties', furnish_type, view_type, owner_id, paginate.page, searchKeyword],
    queryFn: () => {
      const { page, pageSize } = paginate;
      const useKeyword = searchKeyword ? { keyword: searchKeyword } : {};
      const useTypes = {}
      Object.keys(types).forEach(t => {
        if (types[t]) {
          useTypes[t] = types[t]
        }
      })
      return axiosInstance.get('/api/properties', { 
        params: { 
          ...useTypes,
          ...useKeyword, 
          page, pageSize 
        } 
      })
    },
    ...options
  })

  return {
    ...query,
    paginate,
    setPaginate,
  }
}

export function useProperty({ id }) {
  const query = useQuery({
    queryKey: [`property`, id],
    queryFn: _ => {
      return GetProperty(id)
    },
    enabled: !!+id
  })

  return query
}

export function useCount({  }) {
  const query = useQuery({
    queryKey: [`property_count`, ],
    queryFn: _ => {
      return axiosInstance.get(url + '/count', {

      })
    },
  })

  return query
}

export function useFormSubmit({ onSuccess, onError }) {
  const mutation = useMutation({
    mutationFn: ({ id, ...formData }) => {
      if (id) {
        return  UpdateProperty({ id, ...formData })
      }
      return CreateProperty(formData)
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