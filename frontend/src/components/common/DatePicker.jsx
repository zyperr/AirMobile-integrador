import React, { useState, useEffect, useRef } from 'react';

export const DatePickerPersonalizado = ({ fecha, onChange, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Si ya hay una fecha, el calendario se abre en ese mes. Si no, en el mes actual.
    // Usamos 'T12:00:00' para evitar desfases de zona horaria
    const [mesActual, setMesActual] = useState(fecha ? new Date(fecha + 'T12:00:00') : new Date());
    
    const ref = useRef(null);

    // Efecto para cerrar el calendario si el usuario hace clic afuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();

    // Lógica del calendario
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    const primerDiaSemana = new Date(year, month, 1).getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const blanks = Array.from({ length: primerDiaSemana });
    const dias = Array.from({ length: diasEnMes }, (_, i) => i + 1);

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const diasSemana = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

    const handleSelectDay = (dia) => {
        // Formateamos para el backend: YYYY-MM-DD
        const f = new Date(year, month, dia);
        const yyyy = f.getFullYear();
        const mm = String(f.getMonth() + 1).padStart(2, '0');
        const dd = String(f.getDate()).padStart(2, '0');
        
        onChange(`${yyyy}-${mm}-${dd}`);
        setIsOpen(false);
    };

    const cambiarMes = (offset) => {
        setMesActual(new Date(year, month + offset, 1));
    };

    const formatearFechaVisual = (fechaIso) => {
        if (!fechaIso) return '';
        const [y, m, d] = fechaIso.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <div className="position-relative" ref={ref} style={{ minWidth: '220px' }}>
            
            {/* INPUT FALSO (Clickable) */}
            <div className="input-group shadow-sm" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
                <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-calendar3 text-muted" />
                </span>
                <input
                    type="text"
                    readOnly
                    className="form-control border-start-0 text-muted bg-white"
                    placeholder="Filtrar por fecha..."
                    value={formatearFechaVisual(fecha)}
                    style={{ fontSize: '0.9rem', cursor: 'pointer', boxShadow: 'none' }}
                />
                {fecha && (
                    <button
                        type="button"
                        className="btn btn-white border border-start-0 bg-white"
                        onClick={(e) => {
                            e.stopPropagation(); // Evita que se vuelva a abrir el calendario
                            onClear();
                        }}
                    >
                        <i className="bi bi-x text-muted" />
                    </button>
                )}
            </div>

            {/* POPUP DEL CALENDARIO */}
            {isOpen && (
                <div className="position-absolute top-100 start-0 mt-2 bg-white rounded-4 shadow-lg border p-3" style={{ zIndex: 1050, width: '280px' }}>
                    
                    {/* Header del Calendario (Mes y flechas) */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <button type="button" className="btn btn-sm btn-light rounded-circle" style={{ width: '32px', height: '32px' }} onClick={() => cambiarMes(-1)}>
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        <span className="fw-bold" style={{ fontSize: '0.95rem', color: '#111827' }}>
                            {meses[month]} {year}
                        </span>
                        <button type="button" className="btn btn-sm btn-light rounded-circle" style={{ width: '32px', height: '32px' }} onClick={() => cambiarMes(1)}>
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>

                    {/* Días de la semana */}
                    <div className="d-flex mb-2">
                        {diasSemana.map(d => (
                            <div key={d} className="text-center text-muted fw-bold" style={{ width: '14.28%', fontSize: '0.75rem' }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Grilla de días (Números) */}
                    <div className="d-flex flex-wrap">
                        {blanks.map((_, i) => (
                            <div key={`blank-${i}`} style={{ width: '14.28%' }}></div>
                        ))}
                        {dias.map(dia => {
                            // Verificamos si es el día seleccionado actualmente
                            const selected = fecha === `${year}-${String(month + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                            // Verificamos si es "Hoy"
                            const hoy = new Date().toDateString() === new Date(year, month, dia).toDateString();

                            return (
                                <div key={dia} className="p-1" style={{ width: '14.28%' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectDay(dia)}
                                        className={`btn w-100 p-0 rounded-circle d-flex align-items-center justify-content-center ${selected ? 'btn-dark text-white shadow-sm' : hoy ? 'btn-outline-dark fw-bold' : 'btn-light bg-transparent text-dark'}`}
                                        style={{ height: '30px', fontSize: '0.85rem', border: hoy && !selected ? '1px solid #111827' : 'none' }}
                                    >
                                        {dia}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};