import { useEffect, useRef } from "react";
import gopher from "/golanf.png"; // make sure the path is correct

export default function Animal() {
  const leftPupilRef = useRef<HTMLDivElement>(null);
  const rightPupilRef = useRef<HTMLDivElement>(null);
  const leftEyelidRef = useRef<HTMLDivElement>(null);
  const rightEyelidRef = useRef<HTMLDivElement>(null);
  const gopherContainerRef = useRef<HTMLDivElement>(null);

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

        // distance between mouse and eye center
        const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), 100);

        // limit movement range to eye radius
        const maxRange = rect.width * 0.2;
        const moveRange = Math.min(maxRange, (distance / 100) * maxRange);

        const x = moveRange * Math.cos(angle);
        const y = moveRange * Math.sin(angle);

        pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      });
    };

    const blink = () => {
      const lids = [leftEyelidRef.current, rightEyelidRef.current];
      lids.forEach((lid) => {
        if (!lid) return;
        lid.style.height = "100%";
        lid.style.transition = "height 0.1s ease-in";
        setTimeout(() => {
          lid.style.height = "0%";
          lid.style.transition = "height 0.15s ease-out";
        }, 150);
      });
      const nextBlink = Math.random() * 5000 + 2000; 
      setTimeout(blink, nextBlink);
    };

    // Handle mouse click
    const handleMouseDown = () => {
      [leftEyelidRef.current, rightEyelidRef.current].forEach((lid) => {
        if (!lid) return;
        lid.style.height = "100%";
        lid.style.transition = "height 0.1s ease-in";
      });
    };

    const handleMouseUp = () => {
      [leftEyelidRef.current, rightEyelidRef.current].forEach((lid) => {
        if (!lid) return;
        lid.style.height = "0%";
        lid.style.transition = "height 0.15s ease-out";
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Start random blinking
    const firstBlink = setTimeout(blink, 3000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      clearTimeout(firstBlink);
    };
  }, []);

  return (
  
    <div
      ref={gopherContainerRef}
      style={{
        position: "fixed",
        top: "2rem",
        left: "2rem",
        width: "130px",
        height: "130px",
        zIndex: 30,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <img
          src={gopher}
          alt="Gopher"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />

        {/* Left eye */}
        <div
          style={{
            position: "absolute",
            top: "6%",
            left: "28%",
            width: "25px",
            height: "25px",
            backgroundColor: "white",
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid black",
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
          {/* Eyelid */}
          <div
            ref={leftEyelidRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "0%",
              backgroundColor: "#333",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* Right eye */}
        <div
          style={{
            position: "absolute",
            top: "5%",
            right: "30%",
            width: "25px",
            height: "25px",
            backgroundColor: "white",
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid black",
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
          {/* Eyelid */}
          <div
            ref={rightEyelidRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "0%",
              backgroundColor: "#333",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>
       
    </div>
  );
}
