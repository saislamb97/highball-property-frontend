
const EXPIRED_AT_KEY = k => k + '__expiredAt';

export const local = {
  get(key) {
    const data = localStorage.getItem(key)
    const expiredAt = localStorage.getItem( EXPIRED_AT_KEY(key) );
    if (expiredAt && expiredAt < Date.now()) {
      this.remove(key)
      return null
    }

    try {
      return JSON.parse(data)
    } catch (e) {
      return data
    }
  },

  set(key, data, expiredAt = 0) {
    localStorage.setItem(key, JSON.stringify(data))
    if (expiredAt) {
      localStorage.setItem( EXPIRED_AT_KEY(key), expiredAt )
    }
  },

  remove(key) {
    localStorage.removeItem(key)
    localStorage.removeItem( EXPIRED_AT_KEY(key) );
  }
}

export const session = {
  get(key) {
    const data = sessionStorage.getItem(key)
    try {
      return JSON.parse( data )
    } catch (e) {
      return data
    }
  },

  set(key, data) {
    sessionStorage.setItem(key, JSON.stringify(data))
  },

  remove(key) {
    sessionStorage.removeItem(key)
  }
}

// both
export const get = key => {
  if (localStorage.hasOwnProperty(key)) {
    return local.get(key)
  }
  if (sessionStorage.hasOwnProperty(key)) {
    return session.get(key)
  }
}

export const remove = key => {
  local.remove(key)
  session.remove(key)
}