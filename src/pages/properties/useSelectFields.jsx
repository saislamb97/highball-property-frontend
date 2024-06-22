import { useEffect, useState } from "react";
import { toGamel } from "src/utils/Utils";
import axiosInstance from "src/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export default function useSelectFields({ clearable = false, onFormChange }) {

  const fields = [
    'furnish_type', 'view_type', 'owner_id'
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

  const { isLoading, data = [] } = useQuery({
    queryKey: ['property_select_types'], 
    queryFn: _ => Promise.all([
      axiosInstance.get('/api/users'),
      ...fields.slice(0, 2).map(f => axiosInstance.get(`/api/properties/${f}`)),
    ])
  })

  useEffect(() => {
    if (!isLoading) {
      const [owners, ...results] = data
      selectFields.forEach(t => {
        if (t.field === 'owner_id') {
          t.options = owners.map(t => ({ 
            value: t.id,
            name: <div  style={{ lineHeight: 1.1 }}>
              <span>{t.id}. {t.username} </span> <br/>
              <span style={{color: '#4fc1ff' }}>{t.email}</span>
            </div>,
            label: t.id + '. ' + t.username, 
          }))
        }
        fields.slice(0, 2).forEach((k, i) => {
          if (t.field === k) {
            t.options = results[i].map(t => ({ name: toGamel(t), value: t }))
          }
        })
        if (clearable) {
          t.options.push({ name: '❌UNSET❌', value: '' })
        }
      })
      setSelectFields([...selectFields])
    }
  }, [isLoading])

  return selectFields
}