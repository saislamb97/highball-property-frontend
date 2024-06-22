import { Navigate } from "react-router-dom";

export const QueryReallignment = (queryData) => {
  if (queryData) {
    let query = '';
    for (const [key, value] of Object.entries(queryData)) {
      if (
        value === null ||
        (typeof value === 'string' && value.trim() === '')
      ) {
      } else {
        let result = `${key}=${value}&`;
        query = result + query;
      }
    }
    let result = query.slice(0, -1);
    return result;
  }
};

export const checkForm = (formData) => {
  let errorState = {};
  Object.keys(formData).forEach((item) => {
    if (formData[item] === null || formData[item] === "") {
      errorState[item] = "This field is required";
    }
  });
  return errorState;
};


export const RedirectAs404 = ({ location }) => (
  <Navigate replace to={Object.assign({}, location, { state: { is404: true } })} />
);



/**
 * 获取两个日期之间的所有日期数组
 * @param {date} start 起始日期 YYYY-MM-DD
 * @param {date} end 结束日期
 * @return {[]date}
 */
export function getBetweenDates(start, end) {
  const startDate = new Date(start).toISOString();
  const endDate = new Date(end).toISOString();
	var [sy, sm, sd] = startDate.replace(/(\d{4}-\d{2}-\d{2})(.+)/, '$1').split("-");
	var [ey, em, ed] = endDate.replace(/(\d{4}-\d{2}-\d{2})(.+)/, '$1').split("-");
	var db = new Date(+sy, +sm - 1, +sd);
	var de = new Date(+ey, +em - 1, +ed);
	var unixDb = db.getTime();
	var unixDe = de.getTime();
	const result = []
	for (var k = unixDb; k <= unixDe;) {
		result.push(new Date(parseInt(k)))
		k = k + 24 * 60 * 60 * 1000;
	}
	return result;
}

/**
 * delay
 * @param {number} ms 
 * @returns {promise}
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * aa_bb_cc => Aa Bb Cc
 * @param {string} field 
 * @returns {string}
 */
export const toGamel = field => 
  field
    .replace(/_id$/, '')
    .split(/[_ ]/)
    .filter(Boolean)
    .map(k => 
      k.slice(0, 1)
      .toUpperCase() + k.slice(1)
      .toLowerCase()
    )
    .join(' ');

export const toDate = d => new Date(d).toLocaleDateString()
export const toTime = d => new Date(d).toLocaleString().slice(0, -3)

export const ellipsis = (label = '', count = 10) => (label || "").slice(0, count) + (label.length > count ? '...' : '')

/**
 * 
 * @param {string} url 
 * @param {string} type link | base64
 * @returns 
 */
export const asset = (url, type = 'link') => {
  if (!url) {
    if (type === 'link') {
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs='
    }
    return ''
  }
  
  if (~url.indexOf('http') || url.includes(';base64,')) {
    return url
  }
  if (type === 'link') {
    return (process.env.REACT_APP_ASSET_HOST || '') + (~url.indexOf('/') ? '' : '/') + url
  }
  if (type === 'base64') {
    return 'data:image/gif;base64,' + url
  }
}