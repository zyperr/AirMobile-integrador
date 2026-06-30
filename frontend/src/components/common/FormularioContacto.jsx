import { useState } from 'react';
import { useApi } from '../../hooks/useApi';

const FormularioContacto = () => {
    const [campos, setCampos] = useState({
        nombre: '', email: '', asunto: '', descripcion: ''
    });
    const [errores, setErrores] = useState({});
    const [exito, setExito] = useState(false);
    const { ejecutarPeticion, isLoading } = useApi();

    const validar = () => {
        const e = {};
        if (!campos.nombre.trim())      e.nombre      = 'El nombre es requerido.';
        if (!campos.email.trim())       e.email       = 'El email es requerido.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email))
                                        e.email       = 'El email no es válido.';
        if (!campos.asunto.trim())      e.asunto      = 'El asunto es requerido.';
        if (campos.descripcion.trim().length < 10)
                                        e.descripcion = 'Mínimo 10 caracteres.';
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCampos(prev => ({ ...prev, [name]: value }));
        if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nuevosErrores = validar();
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        const respuesta = await ejecutarPeticion('contacto/enviar', {
            method: 'POST',
            body: JSON.stringify(campos),
        });

        if (respuesta.exito) {
            setExito(true);
            setCampos({ nombre: '', email: '', asunto: '', descripcion: '' });
        }
    };

    const inputStyle = (campo) => ({
        borderRadius: 10,
        border: `1.5px solid ${errores[campo] ? '#fca5a5' : '#e5e7eb'}`,
        padding: '10px 14px', fontSize: '0.9rem', width: '100%',
        outline: 'none', background: errores[campo] ? '#fef2f2' : 'white',
        borderRadius: 10,
        width: '100%',
        color: '#111827', // ✅ esto es todo lo que falta

    });

    return (
        <section style={{ background: '#f8f9fc', padding: '64px 16px' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>

                <div className="text-center mb-4">
                    <span style={{
                        background: '#eff6ff', color: '#1d4ed8',
                        borderRadius: 20, padding: '4px 14px',
                        fontSize: '0.8rem', fontWeight: 600
                    }}>CONTACTO</span>
                    <h2 className="fw-bold mt-3 mb-2" style={{ color: '#111827', fontSize: '1.8rem' }}>
                        ¿Tenés alguna consulta?
                    </h2>
                    <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                        Completá el formulario y te respondemos a la brevedad.
                    </p>
                </div>

                <div style={{
                    background: 'white', borderRadius: 16,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: '36px 32px'
                }}>
                    {exito ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: '#f0fdf4', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <i className="bi bi-check-lg" style={{ fontSize: 28, color: '#16a34a' }} />
                            </div>
                            <h4 style={{ color: '#111827', marginBottom: 8 }}>¡Mensaje enviado!</h4>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 24 }}>
                                Te responderemos a la brevedad en <strong>{campos.email || 'tu email'}</strong>.
                            </p>
                            <button
                                onClick={() => setExito(false)}
                                style={{
                                    background: '#1d4ed8', color: 'white',
                                    border: 'none', borderRadius: 8,
                                    padding: '10px 24px', cursor: 'pointer', fontSize: '0.9rem'
                                }}
                            >
                                Enviar otro mensaje
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            {[
                                { name: 'nombre',      label: 'Nombre completo', type: 'text',  placeholder: 'Tu nombre' },
                                { name: 'email',       label: 'Email',           type: 'email', placeholder: 'tu@email.com' },
                                { name: 'asunto',      label: 'Asunto',          type: 'text',  placeholder: '¿En qué te podemos ayudar?' },
                            ].map(({ name, label, type, placeholder }) => (
                                <div className="mb-3" key={name}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#000000', marginBottom: 6, display: 'block' }}>
                                        {label}
                                    </label>
                                    <input
                                        type={type} name={name}
                                        value={campos[name]} onChange={handleChange}
                                        placeholder={placeholder} style={inputStyle(name)}
                                    />
                                    {errores[name] && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: 4 }}>{errores[name]}</p>}
                                </div>
                            ))}

                            <div className="mb-4">
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion" value={campos.descripcion}
                                    onChange={handleChange} rows={5}
                                    placeholder="Contanos más sobre tu consulta..."
                                    style={{ ...inputStyle('descripcion'), resize: 'vertical', lineHeight: 1.6, color:'black'}}
                                />
                                {errores.descripcion && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: 4 }}>{errores.descripcion}</p>}
                            </div>

                            <button
                                type="submit" disabled={isLoading}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: isLoading ? '#93c5fd' : '#1d4ed8',
                                    color: 'white', border: 'none', borderRadius: 10,
                                    fontSize: '0.95rem', fontWeight: 600,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: 8,
                                }}
                            >
                                {isLoading
                                    ? <><i className="bi bi-hourglass-split" /> Enviando...</>
                                    : <><i className="bi bi-send" /> Enviar mensaje</>
                                }
                            </button>
                        </form>
                    )}
                </div>

                <div className="d-flex justify-content-center gap-4 mt-4 flex-wrap">
                    {[
                        { icono: 'bi-envelope', texto: 'airmobileoficial@gmail.com' },
                        { icono: 'bi-clock',    texto: 'Lun - Vie, 9am - 6pm' },
                    ].map(({ icono, texto }) => (
                        <div key={texto} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: '0.85rem' }}>
                            <i className={`bi ${icono}`} style={{ color: '#1d4ed8' }} />
                            {texto}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FormularioContacto;