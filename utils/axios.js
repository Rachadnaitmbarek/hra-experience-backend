

//     var url = $"https://travelnext.works/api/hotel_trawexv6/static_content" + $"?from={from}&to={to}&user_id={userId}&user_password={userPassword}" + $"&ip_address={ipAddress}&access={access}&city_name={CityName}&country_name={CountryName}";

import axios from "axios";


const axiosIns = axios.create({
        baseURL: process.env.TRAWEX_URI
})

axiosIns.interceptors.request.use(function (request) {
        const authData = {
                user_id: process.env.TRAWEX_USER,
                user_password: process.env.TRAWEX_PASSWORD,
                ip_address: process.env.TRAWEX_IP_ADDRESS,
                access: process.env.TRAWEX_ACCESS,
        };

        const method = request.method.toLowerCase();

        if(method == "get") {
                request.params = { ...(request.params || {}), ...authData };
        } else {
                request.data = { ...request.data, ...authData };
        }

        return request;
})

export default axiosIns;