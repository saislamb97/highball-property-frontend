import { useCallback, useEffect, useState } from "react";

/**
 * window.innerWidth <= 768
 * @returns {boolean}
 */
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const handleResize = useCallback(() => {
    return setIsMobile(window.innerWidth <= 768);
  }, [])
  
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile
}