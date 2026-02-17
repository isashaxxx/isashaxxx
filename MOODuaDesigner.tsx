import { useState, useRef } from "react"

export default function MOODuaDesigner() {
    const [shirtColor, setShirtColor] = useState("#14b8a6")
    const [view, setView] = useState("front")
    const [elements, setElements] = useState([])
    const [selectedElement, setSelectedElement] = useState(null)
    const [textInput, setTextInput] = useState("")
    const [fontSize, setFontSize] = useState(24)
    const [textColor, setTextColor] = useState("#000000")
    const fileInputRef = useRef(null)

    const shirtColors = [
        { name: "Бірюзовий", color: "#14b8a6" },
        { name: "Білий", color: "#ffffff" },
        { name: "Чорний", color: "#000000" },
        { name: "Темно-синій", color: "#1e3a8a" },
        { name: "Червоний", color: "#dc2626" },
        { name: "Зелений", color: "#16a34a" },
        { name: "Жовтий", color: "#facc15" },
        { name: "Сірий", color: "#6b7280" },
    ]

    const addText = () => {
        if (textInput.trim()) {
            const newElement = {
                id: Date.now(),
                type: "text",
                content: textInput,
                x: 150,
                y: 200,
                fontSize: fontSize,
                color: textColor,
                rotation: 0,
            }
            setElements([...elements, newElement])
            setTextInput("")
        }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const newElement = {
                    id: Date.now(),
                    type: "image",
                    content: event.target.result,
                    x: 150,
                    y: 150,
                    width: 150,
                    height: 150,
                    rotation: 0,
                }
                setElements([...elements, newElement])
            }
            reader.readAsDataURL(file)
        }
    }

    const deleteElement = (id) => {
        setElements(elements.filter((el) => el.id !== id))
        if (selectedElement?.id === id) setSelectedElement(null)
    }

    const updateElement = (id, updates) => {
        setElements(
            elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
        )
    }

    const moveElement = (id, direction) => {
        const element = elements.find((el) => el.id === id)
        if (!element) return

        const moveAmount = 10
        const updates = {}

        if (direction === "up") updates.y = element.y - moveAmount
        if (direction === "down") updates.y = element.y + moveAmount
        if (direction === "left") updates.x = element.x - moveAmount
        if (direction === "right") updates.x = element.x + moveAmount

        updateElement(id, updates)
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #e0f2f1 0%, #b2ebf2 100%)",
                padding: "20px",
            }}
        >
            {/* Header */}
            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto 30px",
                }}
            >
                <div
                    style={{
                        background: "white",
                        borderRadius: "20px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        padding: "25px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "20px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div
                            style={{
                                width: "60px",
                                height: "60px",
                                background: "#14b8a6",
                                borderRadius: "15px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "32px",
                                fontWeight: "bold",
                            }}
                        >
                            M
                        </div>
                        <div>
                            <h1 style={{ fontSize: "28px", color: "#1f2937", margin: 0 }}>
                                MOODua
                            </h1>
                            <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
                                Конструктор дизайну футболок
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "15px" }}>
                        <button
                            style={{
                                padding: "12px 24px",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "600",
                                cursor: "pointer",
                                background: "#14b8a6",
                                color: "white",
                            }}
                        >
                            ☎ 0800-123-456
                        </button>
                        <button
                            style={{
                                padding: "12px 24px",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "600",
                                cursor: "pointer",
                                background: "#f97316",
                                color: "white",
                            }}
                        >
                            💬 Чат підтримки
                        </button>
                    </div>
                </div>
            </div>

            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "300px 1fr 300px",
                    gap: "25px",
                }}
            >
                {/* Left Panel */}
                <div
                    style={{
                        background: "white",
                        padding: "25px",
                        borderRadius: "20px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                >
                    <h2 style={{ marginBottom: "20px", color: "#1f2937" }}>
                        З чого хочете почати?
                    </h2>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: "2px dashed #d1d5db",
                            padding: "30px",
                            textAlign: "center",
                            borderRadius: "15px",
                            cursor: "pointer",
                            marginBottom: "20px",
                        }}
                    >
                        <div style={{ fontSize: "40px", marginBottom: "10px" }}>📤</div>
                        <span style={{ fontWeight: "600", color: "#4b5563" }}>
                            Завантажити
                        </span>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                    />

                    <div
                        style={{
                            border: "2px solid #e5e7eb",
                            padding: "20px",
                            borderRadius: "15px",
                            marginBottom: "20px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "15px",
                            }}
                        >
                            <span style={{ fontSize: "20px" }}>✏️</span>
                            <span style={{ fontWeight: "600" }}>Додати текст</span>
                        </div>
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Введіть текст..."
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                marginBottom: "10px",
                            }}
                        />
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <div>
                                <label style={{ fontSize: "12px", color: "#6b7280" }}>
                                    Розмір
                                </label>
                                <input
                                    type="number"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "6px",
                                    }}
                                    min="12"
                                    max="72"
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", color: "#6b7280" }}>
                                    Колір
                                </label>
                                <input
                                    type="color"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                    style={{
                                        width: "100%",
                                        height: "34px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "6px",
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={addText}
                            style={{
                                width: "100%",
                                background: "#14b8a6",
                                color: "white",
                                padding: "12px",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "600",
                                cursor: "pointer",
                            }}
                        >
                            Додати текст
                        </button>
                    </div>

                    <div
                        style={{
                            background: "#f0fdfa",
                            border: "1px solid #99f6e4",
                            padding: "15px",
                            borderRadius: "10px",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "14px",
                                color: "#115e59",
                                fontWeight: "600",
                                marginBottom: "10px",
                            }}
                        >
                            💡 Підказки:
                        </p>
                        <ul
                            style={{
                                listStyle: "none",
                                padding: 0,
                                fontSize: "12px",
                                color: "#0f766e",
                            }}
                        >
                            <li>• Клікайте на елементи</li>
                            <li>• Використовуйте стрілки</li>
                            <li>• Змінюйте розмір</li>
                        </ul>
                    </div>
                </div>

                {/* Center Panel */}
                <div
                    style={{
                        background: "white",
                        padding: "25px",
                        borderRadius: "20px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                >
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "30px" }}>
                        <button
                            onClick={() => setView("front")}
                            style={{
                                padding: "10px 30px",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "600",
                                cursor: "pointer",
                                background: view === "front" ? "#14b8a6" : "#f3f4f6",
                                color: view === "front" ? "white" : "#6b7280",
                            }}
                        >
                            Передній
                        </button>
                        <button
                            onClick={() => setView("back")}
                            style={{
                                padding: "10px 30px",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "600",
                                cursor: "pointer",
                                background: view === "back" ? "#14b8a6" : "#f3f4f6",
                                color: view === "back" ? "white" : "#6b7280",
                            }}
                        >
                            Задній
                        </button>
                    </div>

                    <div
                        style={{
                            position: "relative",
                            width: "400px",
                            height: "500px",
                            margin: "0 auto",
                        }}
                    >
                        <svg
                            viewBox="0 0 400 500"
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
                            }}
                        >
                            <path
                                d="M 80 120 L 80 480 L 320 480 L 320 120 L 280 120 L 280 80 Q 280 40 240 40 L 160 40 Q 120 40 120 80 L 120 120 Z M 80 120 L 40 160 L 40 220 L 80 200 Z M 320 120 L 360 160 L 360 220 L 320 200 Z"
                                fill={shirtColor}
                                stroke="#e5e7eb"
                                strokeWidth="2"
                            />
                        </svg>

                        <div
                            style={{
                                position: "absolute",
                                top: "150px",
                                left: "100px",
                                width: "200px",
                                height: "250px",
                                border: "2px dashed #d1d5db",
                                background: "rgba(255,255,255,0.3)",
                                pointerEvents: "none",
                            }}
                        />

                        {elements.map((element) => (
                            <div
                                key={element.id}
                                onClick={() => setSelectedElement(element)}
                                style={{
                                    position: "absolute",
                                    left: element.x + "px",
                                    top: element.y + "px",
                                    transform: `rotate(${element.rotation}deg)`,
                                    cursor: "move",
                                    outline:
                                        selectedElement?.id === element.id
                                            ? "2px solid #14b8a6"
                                            : "none",
                                }}
                            >
                                {element.type === "text" ? (
                                    <div
                                        style={{
                                            fontSize: element.fontSize + "px",
                                            color: element.color,
                                            fontWeight: "bold",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {element.content}
                                    </div>
                                ) : (
                                    <img
                                        src={element.content}
                                        alt="Design"
                                        style={{
                                            width: element.width + "px",
                                            height: element.height + "px",
                                            objectFit: "contain",
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            marginTop: "20px",
                            paddingTop: "20px",
                            borderTop: "1px solid #e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                        }}
                    >
                        <div
                            style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "10px",
                                border: "2px solid #e5e7eb",
                                background: shirtColor,
                            }}
                        />
                        <div>
                            <p style={{ fontWeight: "bold", margin: 0 }}>
                                Футболка Gildan Softstyle
                            </p>
                            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                                {shirtColors.find((c) => c.color === shirtColor)?.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div
                    style={{
                        background: "white",
                        padding: "25px",
                        borderRadius: "20px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                >
                    <h3 style={{ marginBottom: "20px" }}>Колір футболки</h3>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "10px",
                            marginBottom: "25px",
                        }}
                    >
                        {shirtColors.map((color) => (
                            <button
                                key={color.color}
                                onClick={() => setShirtColor(color.color)}
                                style={{
                                    width: "100%",
                                    aspectRatio: "1",
                                    border:
                                        shirtColor === color.color
                                            ? "2px solid #14b8a6"
                                            : "2px solid #e5e7eb",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    background: color.color,
                                    transform:
                                        shirtColor === color.color ? "scale(1.1)" : "scale(1)",
                                }}
                            />
                        ))}
                    </div>

                    {selectedElement && (
                        <div style={{ marginBottom: "25px" }}>
                            <h3 style={{ marginBottom: "15px" }}>Редагувати</h3>

                            <div style={{ marginBottom: "15px" }}>
                                <label
                                    style={{
                                        fontSize: "14px",
                                        color: "#6b7280",
                                        display: "block",
                                        marginBottom: "10px",
                                    }}
                                >
                                    Позиція
                                </label>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)",
                                        gap: "5px",
                                    }}
                                >
                                    <div></div>
                                    <button
                                        onClick={() => moveElement(selectedElement.id, "up")}
                                        style={{
                                            padding: "10px",
                                            background: "#f3f4f6",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        ↑
                                    </button>
                                    <div></div>
                                    <button
                                        onClick={() => moveElement(selectedElement.id, "left")}
                                        style={{
                                            padding: "10px",
                                            background: "#f3f4f6",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        ←
                                    </button>
                                    <button
                                        style={{
                                            padding: "10px",
                                            background: "#d1d5db",
                                            border: "none",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        ⊕
                                    </button>
                                    <button
                                        onClick={() =>
                                            moveElement(selectedElement.id, "right")
                                        }
                                        style={{
                                            padding: "10px",
                                            background: "#f3f4f6",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        →
                                    </button>
                                    <div></div>
                                    <button
                                        onClick={() => moveElement(selectedElement.id, "down")}
                                        style={{
                                            padding: "10px",
                                            background: "#f3f4f6",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        ↓
                                    </button>
                                    <div></div>
                                </div>
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label
                                    style={{
                                        fontSize: "14px",
                                        color: "#6b7280",
                                        display: "block",
                                        marginBottom: "5px",
                                    }}
                                >
                                    Поворот: {selectedElement.rotation}°
                                </label>
                                <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    value={selectedElement.rotation}
                                    onChange={(e) =>
                                        updateElement(selectedElement.id, {
                                            rotation: Number(e.target.value),
                                        })
                                    }
                                    style={{ width: "100%" }}
                                />
                            </div>

                            {selectedElement.type === "image" && (
                                <div style={{ marginBottom: "15px" }}>
                                    <label
                                        style={{
                                            fontSize: "14px",
                                            color: "#6b7280",
                                            display: "block",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        Розмір
                                    </label>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button
                                            onClick={() =>
                                                updateElement(selectedElement.id, {
                                                    width: Math.max(
                                                        50,
                                                        selectedElement.width - 10
                                                    ),
                                                    height: Math.max(
                                                        50,
                                                        selectedElement.height - 10
                                                    ),
                                                })
                                            }
                                            style={{
                                                flex: 1,
                                                background: "#f3f4f6",
                                                padding: "10px",
                                                border: "none",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            − Менше
                                        </button>
                                        <button
                                            onClick={() =>
                                                updateElement(selectedElement.id, {
                                                    width: Math.min(
                                                        300,
                                                        selectedElement.width + 10
                                                    ),
                                                    height: Math.min(
                                                        300,
                                                        selectedElement.height + 10
                                                    ),
                                                })
                                            }
                                            style={{
                                                flex: 1,
                                                background: "#f3f4f6",
                                                padding: "10px",
                                                border: "none",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            + Більше
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => deleteElement(selectedElement.id)}
                                style={{
                                    width: "100%",
                                    background: "#ef4444",
                                    color: "white",
                                    padding: "12px",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                🗑️ Видалити
                            </button>
                        </div>
                    )}

                    <div style={{ marginTop: "25px" }}>
                        <button
                            style={{
                                width: "100%",
                                background: "linear-gradient(135deg, #14b8a6, #06b6d4)",
                                color: "white",
                                padding: "15px",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "600",
                                cursor: "pointer",
                                marginBottom: "10px",
                            }}
                        >
                            💾 Зберегти
                        </button>
                        <button
                            style={{
                                width: "100%",
                                background: "#3b82f6",
                                color: "white",
                                padding: "15px",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "600",
                                cursor: "pointer",
                            }}
                        >
                            💰 Дізнатися ціну
                        </button>
                    </div>

                    <div style={{ marginTop: "25px" }}>
                        <h3 style={{ marginBottom: "15px" }}>
                            Елементи ({elements.length})
                        </h3>
                        {elements.length === 0 ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "30px",
                                    color: "#9ca3af",
                                    fontSize: "14px",
                                }}
                            >
                                Додайте текст або зображення
                            </div>
                        ) : (
                            <div>
                                {elements.map((element, index) => (
                                    <div
                                        key={element.id}
                                        onClick={() => setSelectedElement(element)}
                                        style={{
                                            padding: "15px",
                                            border:
                                                selectedElement?.id === element.id
                                                    ? "1px solid #14b8a6"
                                                    : "1px solid #e5e7eb",
                                            background:
                                                selectedElement?.id === element.id
                                                    ? "#f0fdfa"
                                                    : "white",
                                            borderRadius: "10px",
                                            marginBottom: "10px",
                                            cursor: "pointer",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                            }}
                                        >
                                            <span>
                                                {element.type === "text" ? "📝" : "🖼️"}
                                            </span>
                                            <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                                {element.type === "text"
                                                    ? element.content.substring(0, 15) +
                                                      (element.content.length > 15 ? "..." : "")
                                                    : "Зображення " + (index + 1)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                deleteElement(element.id)
                                            }}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "#ef4444",
                                                cursor: "pointer",
                                                fontSize: "18px",
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
