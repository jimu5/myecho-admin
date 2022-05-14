import axios from '../axios';

export interface user {
    id: number;
    nick_name: string;
}

export interface loginParams {
    email: string;
    name: string;
    password: string;
}

export interface loginResponse {
    email: string;
    name: string;
    nick_name: string;
    last_login: string;
    permission_type: number;
    token: string;
}

export class UserApi {
    static login(params: loginParams) {
        return axios.post("/login", params);
    }
}
