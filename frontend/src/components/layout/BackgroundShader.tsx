import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 mouse;
  varying vec2 vUv;

  #define S(a, b, t) smoothstep(a, b, t)

  float DistLine(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * t);
  }

  float N21(vec2 p) {
    p = fract(p * vec2(233.34, 851.73));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
  }

  vec2 N22(vec2 p) {
    float n = N21(p);
    return vec2(n, N21(p + n));
  }

  vec2 GetPos(vec2 id, vec2 offset) {
    vec2 n = N22(id + offset);
    return offset + sin(n * time) * 0.4;
  }

  float Layer(vec2 uv) {
    float m = 0.0;
    vec2 gv = fract(uv) - 0.5;
    vec2 id = floor(uv);
    
    vec2 p[9];
    int i = 0;
    for(float y = -1.0; y <= 1.0; y++) {
      for(float x = -1.0; x <= 1.0; x++) {
        p[i++] = GetPos(id, vec2(x, y));
      }
    }
    
    float t = time * 0.1;
    for(int i = 0; i < 9; i++) {
      m += S(0.1, 0.0, length(gv - p[i])) * S(1.0, 0.5, length(gv - p[i])) * 0.5;
      
      for(int j = i + 1; j < 9; j++) {
        float d = length(p[i] - p[j]);
        float mask = S(1.2, 0.5, d);
        mask *= S(0.01, 0.005, DistLine(gv, p[i], p[j]));
        m += mask * (1.2 - d);
      }
    }
    
    return m;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    vec2 m = mouse.xy / resolution.xy - 0.5;
    
    float gradient = length(vUv - 0.5);
    vec3 color = mix(vec3(0.01, 0.08, 0.15), vec3(0.0, 0.02, 0.05), gradient);
    
    float m1 = 0.0;
    float t = time * 0.05;
    
    for(float i = 0.0; i < 1.0; i += 1.0/3.0) {
      float z = fract(i + t);
      float size = mix(10.0, 0.5, z);
      float fade = S(0.0, 0.5, z) * S(1.0, 0.8, z);
      m1 += Layer(uv * size + i * 20.0 - m) * fade;
    }
    
    vec3 baseColor = vec3(0.0, 0.94, 1.0); // Civic Cyan
    color += m1 * baseColor * 0.4;
    
    // Vignette
    color *= 1.0 - gradient * 0.5;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const BackgroundShader: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const pixelRatio = window.devicePixelRatio || 1;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const uniforms = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(container.clientWidth * pixelRatio, container.clientHeight * pixelRatio) },
      mouse: { value: new THREE.Vector2(0, 0) }
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      uniforms.time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (event: MouseEvent) => {
      uniforms.mouse.value.x = event.clientX * pixelRatio;
      uniforms.mouse.value.y = (window.innerHeight - event.clientY) * pixelRatio;
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      renderer.setSize(width, height);
      uniforms.resolution.value.set(width * pixelRatio, height * pixelRatio);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-full h-full -z-10 bg-surface-container-lowest pointer-events-none" 
      style={{ display: 'block' }}
    />
  );
};
