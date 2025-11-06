export const authenticate = (data, next) => {
    if (typeof window !== 'undefined') {
        // Store token as a plain string (no JSON.stringify)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    next();
};

export const getUser = () => {
    if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('user');
        if (raw) {
            try {
                return JSON.parse(raw);
            } catch {
                return raw;
            }
        }
        return false;
    }
};

// remove token from local storage
export const logout = next => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    next();
};

export const getToken = () => {
    if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('token');
        if (!raw) return false;
        // Be robust: if token was previously stored as JSON, parse it; otherwise return as-is
        try {
            const parsed = JSON.parse(raw);
            return typeof parsed === 'string' ? parsed : raw;
        } catch {
            return raw;
        }
    }
};