import { useEffect, useRef } from "react";

export default function Animal() {
  const leftPupilRef = useRef<HTMLDivElement>(null);
  const rightPupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const pupils = [leftPupilRef.current, rightPupilRef.current];
      if (!pupils[0] || !pupils[1]) return;

      pupils.forEach((pupil) => {
        if (!pupil || !pupil.parentElement) return;
        const rect = pupil.parentElement.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const deltaX = e.clientX - eyeCenterX;
        const deltaY = e.clientY - eyeCenterY;

        const angle = Math.atan2(deltaY, deltaX);
        const radius = 4; // max movement of pupil

        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        pupil.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "2rem",
        left: "2rem",
        width: "120px",
        height: "120px",
        zIndex: 9999,
      }}
    >
      {/* Cat face */}
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#333",
          borderRadius: "50%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 0 10px rgba(0,255,128,0.5)",
        }}
      >
        {/* Ears */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            left: "15px",
            width: "30px",
            height: "30px",
            backgroundColor: "#333",
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "15px",
            width: "30px",
            height: "30px",
            backgroundColor: "#333",
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
        />

        {/* Eyes */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "30%",
            width: "20px",
            height: "20px",
            backgroundColor: "white",
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <div
            ref={leftPupilRef}
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: "black",
              borderRadius: "50%",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              transition: "transform 0.05s",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "30%",
            width: "20px",
            height: "20px",
            backgroundColor: "white",
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <div
            ref={rightPupilRef}
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: "black",
              borderRadius: "50%",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              transition: "transform 0.05s",
            }}
          />
        </div>

        {/* Nose */}
        <div
          style={{
            position: "absolute",
            top: "60%",
            width: "12px",
            height: "8px",
            backgroundColor: "pink",
            borderRadius: "50%",
          }}
        />

        {/* Mouth */}
        <div
          style={{
            position: "absolute",
            top: "70%",
            width: "30px",
            height: "10px",
            borderBottom: "2px solid pink",
            borderRadius: "0 0 50% 50%",
          }}
        />
      </div>
    </div>
  );
}

