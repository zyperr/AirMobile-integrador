import { useState } from "react";

export function ImageGallery({ images }) {
    const [selected, setSelected] = useState(0);
    
    if (images === undefined || images.length === 0) {
        return (
            <div>
            </div>
        )
    }
    return (
        <div>
            <div
                className="bg-light rounded-4 d-flex align-items-center justify-content-center mb-3"
                style={{ height: 380, overflow: "hidden" }}
            >
                <img
                    src={images[selected]}
                    alt="iPhone 13 Pro"
                    style={{ maxHeight: 340, maxWidth: "100%", objectFit: "contain", transition: "opacity 0.2s" }}
                    onError={e => { e.target.src = "https://res.cloudinary.com/duharodwe/image/upload/q_auto/f_auto/v1778722109/landscape-placeholder_x9oxfw.svg"; }}
                />
            </div>
            <div className="d-flex gap-2 justify-content-center">
                {images.map((img, i) => (
                    <div
                        key={i}
                        onClick={() => setSelected(i)}
                        className={`rounded-3 border d-flex align-items-center justify-content-center bg-light ${selected === i ? "border-primary border-2" : "border-light-subtle"}`}
                        style={{ width: 64, height: 64, cursor: "pointer", overflow: "hidden", transition: "border-color 0.2s" }}
                    >
                        <img src={img} alt="" style={{ maxHeight: 54, maxWidth: 54, objectFit: "contain" }}
                            onError={e => { e.target.src = "https://res.cloudinary.com/duharodwe/image/upload/q_auto/f_auto/v1778722109/landscape-placeholder_x9oxfw.svg"; }} />
                    </div>
                ))}
            </div>
        </div>
    );
}