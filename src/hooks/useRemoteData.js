import { useEffect, useState } from "react";
import axiosInstance from "src/utils/axiosInstance";

/**
 * @param {function} formatItem 
 * @returns {array}
 */
export default function useRemoteData({ api, params, dataType = Array, resHook = t => t }) {
  const [data, setData] = useState(dataType());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(api, { params }).then(resHook)
        setData(res);
      } catch (e) {}
    }
    fetchData()
  }, [])
  return data
}