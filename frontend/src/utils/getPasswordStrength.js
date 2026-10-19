// Función para calcular la fuerza de la contraseña
export const getPasswordStrength = (password) => {

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { pct: 20, color: "#dc3545", label: "Muy débil" };
    if (score === 2) return { pct: 40, color: "#fd7e14", label: "Débil" };
    if (score === 3) return { pct: 60, color: "#ffc107", label: "Regular" };
    if (score === 4) return { pct: 80, color: "#20c997", label: "Fuerte" };
    return { pct: 100, color: "#198754", label: "Muy fuerte" };
};
