import { APIRequestContext, expect } from "@playwright/test";

export async function getAuthToken(request: APIRequestContext): Promise<string> {
    const API_URL = process.env.API_URL

    const response = await request.post(`${API_URL}/login`, {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        data: {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
        },
    });

    expect(response.ok(), `Error al autenticar por API: ${response.status()}`).toBeTruthy();

    const body = await response.json();

    const token = body.access_token
    expect(token, "El token de autenticación no vino en la respuesta del login").toBeTruthy();

    return token;
}