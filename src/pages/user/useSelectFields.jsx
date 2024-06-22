import { useEffect, useState } from "react";
import { toGamel } from "src/utils/Utils";
import axiosInstance from "src/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export default function useSelectFields({ clearable = false, onFormChange = _ => _ }) {

  const fields = [
    'role', 'gender'
  ];

  const [selectFields, setSelectFields] = useState(
    fields.map(field => 
      ({
        type: 'select',
        field,
        required: true,
        label: toGamel(field),
        onChange: onFormChange,
        options: []
      })
    )
  )

  const { isLoading: typesLoading, data: typeResults = [] } = useQuery({
    queryKey: ['role_gender'], 
    queryFn: _ => Promise.all(
      fields.map(f => axiosInstance.get(`/api/users/${f}`)),
    )
  })

  useEffect(() => {
    if (!typesLoading) {
      selectFields.forEach(t => {
        fields.forEach((k, i) => {
          if (t.field === k) {
            t.options = typeResults[i].map(t => ({ name: toGamel(t), value: t }))
          }
        })

        if (clearable) {
          t.options.push({ name: '❌UNSET❌', value: '' })
        }
      })
      setSelectFields([...selectFields])
    }
  }, [typesLoading])

  return selectFields
}