export const BtnForm = ({isSubmitting, text }) => {
    return (
        <div className="d-grid gap-2">
            <button
                type="submit"
                className="btn-registro w-100 mb-3 text-capitalize"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : text}
            </button>
        </div>
    )
} 