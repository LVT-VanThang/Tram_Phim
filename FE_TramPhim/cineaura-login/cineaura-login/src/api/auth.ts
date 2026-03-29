export type LoginResponse = {
  token: string;
  roles: string[];
  full_name: string;
  email: string;
  phone: string;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';

export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${apiBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const text = await res.text();
  if (!res.ok) {
    let message = 'Đăng nhập thất bại';
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      message = j.message ?? j.error ?? message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return JSON.parse(text) as LoginResponse;
}

export type RegisterResponse = {
  message: string;
  username: string;
  full_name: string;
};

export type RegisterPayload = {
  username: string;
  password: string;
  email: string;
  full_name: string;
  /** Gửi khi có giá trị; backend có thể bắt buộc tùy DTO */
  phone?: string;
};

export async function registerApi(payload: RegisterPayload): Promise<RegisterResponse> {
  const body: Record<string, string> = {
    username: payload.username,
    password: payload.password,
    email: payload.email,
    full_name: payload.full_name,
  };
  if (payload.phone?.trim()) {
    body.phone = payload.phone.trim();
  }

  const res = await fetch(`${apiBase}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    let message = 'Đăng ký thất bại';
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      message = j.error ?? j.message ?? message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return JSON.parse(text) as RegisterResponse;
}
