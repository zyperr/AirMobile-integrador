import { getPasswordStrength } from "../utils/getPasswordStrength"


export const PasswordStrengthBar = ({password}) => {
    const strength = getPasswordStrength(password);
    return (
        <div className="mt-2">
            <div className="password-strength-bar">
                <div
                    className="password-strength-fill"
                    style={{
                        width: `${strength.pct}%`,
                        backgroundColor: strength.color,
                    }}
                />
            </div>
            <small
                style={{ color: strength.color }}
            >
                {strength.label}
            </small>
        </div>
    )
}