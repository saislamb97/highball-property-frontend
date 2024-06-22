import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * @param {string} [key] no key will returns all {}
 * @param {string} T data type
 * @returns {T|object}
 */
export default function(key, T = 'string') {
  const location = useLocation();
  const value = useRef('')
  const queryGet = function() {
    const searchParams = new URLSearchParams(location.search);
    if (key == undefined) {
      const values = {}
      for (const [k, v] of searchParams) {
        values[k] = v
      }
      value.current = values
    } else {
      const v = searchParams.get(key)
      value.current = T && T !== 'string' ? JSON.parse(v) : v
    }
  }
  useEffect(queryGet, [location.search])

  queryGet()

  return value.current
}