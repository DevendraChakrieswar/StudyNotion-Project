import axios from "axios"

const baseURL =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_BASE_URL)
    ? process.env.REACT_APP_BASE_URL
    : "http://localhost:4000/api/v1"

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method:`${method}`,
        url:`${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers: null,
        params: params ? params : null,
    });
}