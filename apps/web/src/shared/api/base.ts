import axios, { AxiosHeaders, AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

class ApiInstance {
	private axiosClient: AxiosInstance;
	private accessToken: string | null = null;

	constructor() {
		this.axiosClient = axios.create({
			baseURL: API_URL,
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		});

		this.axiosClient.interceptors.request.use((config) => {
			if (this.accessToken) {
				const headers = AxiosHeaders.from(config.headers);
				headers.set("Authorization", `Bearer ${this.accessToken}`);
				config.headers = headers;
			}
			return config;
		});
	}

	setAccessToken(token: string | null) {
		this.accessToken = token;
	}

	async get<T>(url: string): Promise<T> {
		const response = await this.axiosClient.get<T>(url);
		return response.data;
	}

	async post<TResponse, TBody = unknown>(url: string, body?: TBody): Promise<TResponse> {
		const response = await this.axiosClient.post<TResponse>(url, body);
		return response.data;
	}

	async put<TResponse, TBody = unknown>(url: string, body?: TBody): Promise<TResponse> {
		const response = await this.axiosClient.put<TResponse>(url, body);
		return response.data;
	}

	async patch<TResponse, TBody = unknown>(url: string, body?: TBody): Promise<TResponse> {
		const response = await this.axiosClient.patch<TResponse>(url, body);
		return response.data;
	}

	async delete<T>(url: string): Promise<T> {
		const response = await this.axiosClient.delete<T>(url);
		return response.data;
	}
}

export const api = new ApiInstance();
