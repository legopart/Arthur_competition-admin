import axios from 'axios';


const axiosFunction = axios.create({
    baseURL: 'https://2022.zionet.online/'
    , headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Credentials': true }
    //, withCredentials: true
    //, timeout: 1000
});



export default async function Axios(method, additionUrl, data, additionHeader) {
    try {
        let response = await axiosFunction({
            method: method
            , url: additionUrl
            , data: JSON.stringify(data)
            , headers: additionHeader
        });
        console.log(':: axios success');
        return response.data;
    } catch (error) {
        console.log(':: axios error');
        if (!error.response?.data) throw (() => 'no server connection')();
        throw error.response?.data;
    }
}



