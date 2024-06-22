import { useEffect, useState } from "react";
import { delay, toGamel } from "src/utils/Utils";
import axiosInstance from "src/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export default function useSelectFields({ clearable = false, fields, onFormChange = _ => _ }) {

  fields = fields || [
    'booking_status', 'check_in_status', 'payment_status'
  ];

  const [selectFields, setSelectFields] = useState(
    fields.map(field => 
      ({
        type: 'select',
        field,
        required: true,
        label: toGamel(field),
        onChange: onFormChange,
        options: [{ name: 'Loading...', value: '' }]
      })
    )
  );

  const { isLoading: typesLoading, data: typeResults = [] } = useQuery({
    queryKey: ['booking_status_check_in_status'], 
    queryFn: () => Promise.all(
      fields.map(f => axiosInstance.get(`/api/bookings/${f}`)),
    )
  });

  useEffect(() => {
    if (!typesLoading) {
      selectFields.forEach(t => {
        fields.forEach((k, i) => {
          if (t.field === k) {
            const result = typeResults[i];
            if (result) {
              t.options = result.map(t => ({ name: toGamel(t), value: t }));
            } else {
              t.options = [{ name: 'Loading...', value: '' }];
            }
          }
        });

        if (clearable) {
          t.options.push({ name: '❌UNSET❌', value: '' });
        }
      });
      setSelectFields([...selectFields]);
    }
  }, [typesLoading]);

  return selectFields;
}
