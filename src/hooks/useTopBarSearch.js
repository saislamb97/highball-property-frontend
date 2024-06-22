import { useEffect } from "react"
import eventEmitter from 'src/eventEmitter';
import { TOPBAR_SEARCH_ON_EVENT } from 'src/eventEmitter/eventTypes';

/**
 * @param {function} searchHandle 
 */
export default function useTopBarSearch(searchHandle) {
  useEffect(() => {
    const handleSearch = keyword => {
      searchHandle(keyword)
    }

    eventEmitter.on(TOPBAR_SEARCH_ON_EVENT, handleSearch)
    return () => {
      eventEmitter.off(TOPBAR_SEARCH_ON_EVENT, handleSearch)
    }
  }, [])
}