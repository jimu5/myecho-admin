import axios from '../myaxios';

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

export interface setupParams {
    name: string;
    email: string;
    password: string;
    site_title: string;
    site_description: string;
}

export interface setupStatus {
    needs_setup: boolean;
}

export interface setupResponse extends setupStatus {
    user: loginResponse;
}

export interface profileParams {
    email: string;
    nick_name: string;
}

export interface passwordParams {
    old_password: string;
    new_password: string;
}

export class UserApi {
    static login(params: loginParams): Promise<loginResponse> {
        return axios.post<any, loginResponse>("/login", params);
    }

    static setupStatus(): Promise<setupStatus> {
        return axios.get<any, setupStatus>("/setup/status");
    }

    static setup(params: setupParams): Promise<setupResponse> {
        return axios.post<any, setupResponse>("/setup", params);
    }

    static profile(): Promise<loginResponse> {
        return axios.get<any, loginResponse>("/account/profile");
    }

    static updateProfile(params: profileParams): Promise<loginResponse> {
        return axios.patch<any, loginResponse>("/account/profile", params);
    }

    static updatePassword(params: passwordParams): Promise<loginResponse> {
        return axios.patch<any, loginResponse>("/account/password", params);
    }

    static logout(token: string): Promise<{ logged_out: boolean }> {
        return axios.post<any, { logged_out: boolean }>("/logout", undefined, {
            headers: { Authorization: `token ${token}` },
        });
    }
}
