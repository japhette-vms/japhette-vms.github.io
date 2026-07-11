/* ==========================================================================
   three-bg.js — Ambient 3D "Ops Network" background
   A slowly rotating field of connected nodes, rendered with Three.js.
   Reacts to: mouse position (parallax), scroll (depth drift), and the
   site's lights-on/lights-off theme toggle (line/node color).
   Designed to be decorative + lightweight — pauses when tab is hidden,
   trims particle count on small screens, and never blocks interaction
   (canvas is pointer-events: none).
   ========================================================================== */

(function () {
    if (typeof THREE === "undefined") return;

    const canvas = document.getElementById("bgCanvas3D");
    if (!canvas) return;

    const isSmallScreen = window.innerWidth < 768;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const NODE_COUNT = isSmallScreen ? 60 : 140;
    const LINK_DIST = isSmallScreen ? 5.2 : 6.5;
    const FIELD_RADIUS = 34;

    // ---- Renderer / Scene / Camera -----------------------------------
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );
    camera.position.z = 42;

    const rig = new THREE.Group();
    scene.add(rig);

    // ---- Node field -----------------------------------------------------
    const nodePositions = [];
    for (let i = 0; i < NODE_COUNT; i++) {
        const v = new THREE.Vector3(
            (Math.random() - 0.5) * FIELD_RADIUS,
            (Math.random() - 0.5) * FIELD_RADIUS * 0.6,
            (Math.random() - 0.5) * FIELD_RADIUS
        );
        nodePositions.push(v);
    }

    const pointsGeo = new THREE.BufferGeometry().setFromPoints(nodePositions);
    const pointsMat = new THREE.PointsMaterial({
        size: 0.55,
        color: 0xffffff,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    rig.add(points);

    // ---- Connective lines between nearby nodes --------------------------
    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.12
    });
    const linePositions = [];
    for (let i = 0; i < nodePositions.length; i++) {
        for (let j = i + 1; j < nodePositions.length; j++) {
            if (nodePositions[i].distanceTo(nodePositions[j]) < LINK_DIST) {
                linePositions.push(
                    nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
                    nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
                );
            }
        }
    }
    lineGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3)
    );
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    rig.add(lines);

    // ---- Theme sync -------------------------------------------------------
    function applyTheme() {
        const lightsOn = document.body.classList.contains("lights-on");
        const color = lightsOn ? 0x1c1c1e : 0xffffff;
        pointsMat.color.setHex(color);
        lineMat.color.setHex(color);
        pointsMat.opacity = lightsOn ? 0.35 : 0.55;
        lineMat.opacity = lightsOn ? 0.07 : 0.12;
    }
    applyTheme();

    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    // ---- Interaction: mouse parallax + scroll drift ------------------------
    let targetX = 0, targetY = 0;
    window.addEventListener("mousemove", (e) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let scrollFactor = 0;
    window.addEventListener("scroll", () => {
        scrollFactor = window.scrollY * 0.0025;
    }, { passive: true });

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ---- Pause when tab hidden (saves battery/CPU) -------------------------
    let running = true;
    document.addEventListener("visibilitychange", () => {
        running = !document.hidden;
        if (running) animate();
    });

    // ---- Animation loop -----------------------------------------------------
    const clock = new THREE.Clock();
    function animate() {
        if (!running) return;
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        if (!reducedMotion) {
            rig.rotation.y = t * 0.035 + scrollFactor;
            rig.rotation.x = Math.sin(t * 0.08) * 0.08;
        }

        camera.position.x += (targetX * 4 - camera.position.x) * 0.02;
        camera.position.y += (-targetY * 3 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();
})();
