import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useRef, useEffect } from "react";

/* Mouse-follow UI shape with all effects */
function MouseShape() {
  const ref = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const hoverOn = () => ref.current?.classList.add("hover");
    const hoverOff = () => ref.current?.classList.remove("hover");

    window.addEventListener("mousemove", move);
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", hoverOn);
      el.addEventListener("mouseleave", hoverOff);
    });

    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.20;
      pos.current.y += (target.current.y - pos.current.y) * 0.20;

      if (ref.current) {
        ref.current.style.left = `${pos.current.x}px`;
        ref.current.style.top = `${pos.current.y}px`;

        // Color change near center (galaxy feel)
        const dx = pos.current.x - window.innerWidth / 2;
        const dy = pos.current.y - window.innerHeight / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
          ref.current.style.backgroundColor = "#7df9ff"; // trending neon
        } else {
          ref.current.style.backgroundColor = "#5b5bff";
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", move);
      document.querySelectorAll("a, button").forEach((el) => {
        el.removeEventListener("mouseenter", hoverOn);
        el.removeEventListener("mouseleave", hoverOff);
      });
    };
  }, []);

  return <div ref={ref} className="mouse-shape pulse" />;
}

/* Stars react & repel from cursor */
function MouseStars() {
  const ref = useRef();
  const { mouse } = useThree();

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.getElapsedTime();

    // Cursor interaction + ambient motion
    ref.current.rotation.x =
      mouse.y * 0.25 + Math.sin(t * 0.3) * 0.05;
    ref.current.rotation.y =
      mouse.x * 0.25 + Math.cos(t * 0.3) * 0.05;
  });

  return (
    <Stars
      ref={ref}
      radius={120}
      depth={80}
      count={20000}
      factor={4}
      fade
    />
  );
}

export default function Background() {
  return (
    <>
      <MouseShape />
      <Canvas
        camera={{ position: [0, 0, 5] }}
        style={{ position: "fixed", inset: 0, zIndex: -1 }}
      >
        <ambientLight intensity={0.4} />
        <MouseStars />
      </Canvas>
    </>
  );
}
