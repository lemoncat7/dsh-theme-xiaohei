import {
  XIAOHEI_AVATAR_BLINK,
  XIAOHEI_AVATAR_CLIMB,
  XIAOHEI_AVATAR_JUMP,
  XIAOHEI_AVATAR_OPEN,
} from '../generated-avatar-model.js'

export const XIAOHEI_SYLVA_AVATAR_MARKER = 'data-xiaohei-avatar-model'

const AVATAR_ADAPTER = `
  /* ${XIAOHEI_SYLVA_AVATAR_MARKER}="true" — the character is part of the
     authored Three.js world and shares its renderer, camera and pointer. */
  var xiaoheiAvatar = null;
  var xiaoheiAvatarRay = new THREE.Raycaster();
  var xiaoheiAvatarPointer = new THREE.Vector3();
  var xiaoheiAvatarHover = 0;
  var xiaoheiAvatarOffsetX = 0;
  var xiaoheiAvatarOffsetY = 0;
  var xiaoheiAvatarNextBlink = performance.now() + 2600 + Math.random() * 2200;
  var xiaoheiAvatarBlinkUntil = 0;
  var xiaoheiAvatarDoubleBlink = false;
  var xiaoheiAvatarNearLimbs = null;
  var xiaoheiAvatarAnchors = [];
  var xiaoheiAvatarAction = 'idle';
  var xiaoheiAvatarActionStart = 0;
  var xiaoheiAvatarActionDuration = 1;
  var xiaoheiAvatarNextAction = performance.now() + 4200;
  var xiaoheiAvatarCurrentAnchor = null;
  var xiaoheiAvatarTargetAnchor = null;
  var xiaoheiAvatarFrom = new THREE.Vector3();
  var xiaoheiAvatarTo = new THREE.Vector3();
  var xiaoheiAvatarAt = new THREE.Vector3();
  var xiaoheiAvatarProjected = new THREE.Vector3();
  var xiaoheiAvatarOpenSource = ${JSON.stringify(XIAOHEI_AVATAR_OPEN)};
  var xiaoheiAvatarBlinkSource = ${JSON.stringify(XIAOHEI_AVATAR_BLINK)};
  var xiaoheiAvatarClimbSource = ${JSON.stringify(XIAOHEI_AVATAR_CLIMB)};
  var xiaoheiAvatarJumpSource = ${JSON.stringify(XIAOHEI_AVATAR_JUMP)};

  var xiaoheiAvatarPose = {
    idle:  { aspect: 0.4375, scale: 1.00, pivotX: 0.50, pivotY: 0.955 },
    climb: { aspect: 0.7998, scale: 0.91, pivotX: 0.325, pivotY: 0.265 },
    jump:  { aspect: 1.0000, scale: 0.82, pivotX: 0.50, pivotY: 0.55 }
  };

  function xiaoheiAvatarTexture(source, done) {
    new THREE.TextureLoader().load(source, function (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.premultiplyAlpha = true;
      if ('sRGBEncoding' in THREE) texture.encoding = THREE.sRGBEncoding;
      done(texture);
    });
  }

  function xiaoheiAvatarMakeGlow() {
    var texture = radialTexture(128, [
      [0, 'rgba(128,186,112,0.24)'],
      [0.38, 'rgba(105,157,91,0.10)'],
      [1, 'rgba(70,112,66,0)']
    ]);
    var material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      opacity: 0
    });
    material.toneMapped = false;
    var glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    glow.renderOrder = 4;
    return glow;
  }

  function xiaoheiAvatarBuild() {
    if (!scene || xiaoheiAvatar) return;
    var loaded = {};
    function finish() {
      if (!loaded.open || !loaded.blink || !loaded.climb || !loaded.jump || xiaoheiAvatar || !scene) return;
      var material = new THREE.MeshBasicMaterial({
        map: loaded.open,
        transparent: true,
        alphaTest: 0.025,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide
      });
      material.toneMapped = false;
      var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
      mesh.renderOrder = 5;
      mesh.frustumCulled = false;
      mesh.name = 'xiaohei-avatar-model';

      var group = new THREE.Group();
      group.name = 'xiaohei-avatar-rig';
      var glow = xiaoheiAvatarMakeGlow();
      group.add(glow);
      group.add(mesh);
      scene.add(group);
      xiaoheiAvatar = {
        group: group,
        mesh: mesh,
        glow: glow,
        material: material,
        open: loaded.open,
        blink: loaded.blink,
        climb: loaded.climb,
        jump: loaded.jump,
        pose: 'idle',
        height: 1,
        baseX: 0,
        baseY: 0,
        z: 86,
        closed: false
      };
      document.documentElement.dataset.xiaoheiAvatarReady = 'true';
      xiaoheiAvatarLayout();
      renderFrame();
    }
    xiaoheiAvatarTexture(xiaoheiAvatarOpenSource, function (texture) {
      loaded.open = texture;
      finish();
    });
    xiaoheiAvatarTexture(xiaoheiAvatarBlinkSource, function (texture) {
      loaded.blink = texture;
      finish();
    });
    xiaoheiAvatarTexture(xiaoheiAvatarClimbSource, function (texture) {
      loaded.climb = texture;
      finish();
    });
    xiaoheiAvatarTexture(xiaoheiAvatarJumpSource, function (texture) {
      loaded.jump = texture;
      finish();
    });
  }

  function xiaoheiAvatarBranchPoint(anchor, target) {
    if (!anchor || !xiaoheiAvatarNearLimbs || !nearGroup) return false;
    var limb = xiaoheiAvatarNearLimbs[anchor.limb];
    if (!limb || !limb.curve) return false;
    target.copy(limb.curve.getPointAt(anchor.t));
    target.y += Math.max(0.035, limb.rw(anchor.t) * 0.62);
    nearGroup.localToWorld(target);
    return true;
  }

  function xiaoheiAvatarRefreshAnchors() {
    if (!xiaoheiAvatarNearLimbs || !nearGroup || !camera) return;
    nearGroup.updateMatrixWorld(true);
    var candidates = [];
    var limbCount = Math.min(7, xiaoheiAvatarNearLimbs.length);
    for (var limb = 0; limb < limbCount; limb++) {
      for (var ti = 0; ti < 5; ti++) {
        var anchor = { limb: limb, t: 0.16 + ti * 0.17 };
        if (!xiaoheiAvatarBranchPoint(anchor, xiaoheiAvatarAt)) continue;
        xiaoheiAvatarProjected.copy(xiaoheiAvatarAt).project(camera);
        var sx = (xiaoheiAvatarProjected.x * 0.5 + 0.5) * W;
        var sy = (-xiaoheiAvatarProjected.y * 0.5 + 0.5) * H;
        if (sx < W * 0.24 || sx > W * 0.92 || sy < H * 0.16 || sy > H * 0.86) continue;
        anchor.sx = sx;
        anchor.sy = sy;
        candidates.push(anchor);
      }
    }
    xiaoheiAvatarAnchors = candidates;
    if (!xiaoheiAvatarCurrentAnchor && candidates.length) {
      var targetX = W * (NARROW.matches ? 0.73 : 0.79);
      var targetY = H * 0.66;
      candidates.sort(function (a, b) {
        return Math.hypot(a.sx - targetX, a.sy - targetY) - Math.hypot(b.sx - targetX, b.sy - targetY);
      });
      xiaoheiAvatarCurrentAnchor = candidates[0];
    }
  }

  function xiaoheiAvatarSetPose(pose) {
    if (!xiaoheiAvatar || xiaoheiAvatar.pose === pose) return;
    xiaoheiAvatar.pose = pose;
    xiaoheiAvatar.closed = false;
    xiaoheiAvatar.material.map = pose === 'climb'
      ? xiaoheiAvatar.climb
      : (pose === 'jump' ? xiaoheiAvatar.jump : xiaoheiAvatar.open);
    xiaoheiAvatar.material.needsUpdate = true;
  }

  function xiaoheiAvatarChooseTarget(kind) {
    if (!xiaoheiAvatarCurrentAnchor || !xiaoheiAvatarAnchors.length) return null;
    var current = xiaoheiAvatarCurrentAnchor;
    var pool = xiaoheiAvatarAnchors.filter(function (anchor) {
      var distance = Math.hypot(anchor.sx - current.sx, anchor.sy - current.sy);
      if (kind === 'climb') return anchor.limb === current.limb && Math.abs(anchor.t - current.t) >= 0.12;
      return distance >= 90 && distance <= Math.min(390, W * 0.38);
    });
    if (!pool.length && kind === 'climb') {
      pool = xiaoheiAvatarAnchors.filter(function (anchor) { return anchor !== current; });
    }
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  }

  function xiaoheiAvatarBeginAction(now) {
    if (!xiaoheiAvatarCurrentAnchor || !xiaoheiAvatarAnchors.length || REDUCED) {
      xiaoheiAvatarNextAction = now + 4800;
      return;
    }
    var roll = Math.random();
    var kind = roll < 0.53 ? 'climb' : (roll < 0.84 ? 'jump' : 'portal');
    var target = xiaoheiAvatarChooseTarget(kind);
    if (!target) {
      xiaoheiAvatarNextAction = now + 2600;
      return;
    }
    xiaoheiAvatarAction = kind;
    xiaoheiAvatarActionStart = now;
    xiaoheiAvatarActionDuration = kind === 'climb'
      ? 1700 + Math.random() * 900
      : (kind === 'jump' ? 760 + Math.random() * 260 : 720);
    xiaoheiAvatarTargetAnchor = target;
    xiaoheiAvatarSetPose(kind === 'climb' ? 'climb' : (kind === 'jump' ? 'jump' : 'idle'));
    document.documentElement.dataset.xiaoheiAvatarAction = kind;
  }

  function xiaoheiAvatarFinishAction(now) {
    if (xiaoheiAvatarTargetAnchor) xiaoheiAvatarCurrentAnchor = xiaoheiAvatarTargetAnchor;
    xiaoheiAvatarTargetAnchor = null;
    xiaoheiAvatarAction = 'idle';
    xiaoheiAvatarSetPose('idle');
    xiaoheiAvatar.material.opacity = 1;
    xiaoheiAvatarNextAction = now + 3600 + Math.random() * 4400;
    document.documentElement.dataset.xiaoheiAvatarAction = 'idle';
  }

  function xiaoheiAvatarLayout() {
    if (!xiaoheiAvatar || !camera || W <= 1 || H <= 1) return;
    var narrow = NARROW.matches;
    var desiredHeight = narrow
      ? Math.max(148, Math.min(190, H * 0.235))
      : Math.max(218, Math.min(286, H * 0.315));
    var z = xiaoheiAvatar.z;
    var perspective = (DIST - z) / DIST;
    var screenX = narrow ? W * 0.82 : W * 0.835;
    var bottom = narrow ? Math.max(26, H * 0.035) : Math.max(38, H * 0.055);
    var screenY = H - bottom - desiredHeight * 0.5;
    var height = desiredHeight * perspective;
    xiaoheiAvatar.height = height;
    xiaoheiAvatar.baseX = (screenX - W * 0.5) * perspective;
    xiaoheiAvatar.baseY = (H * 0.5 - screenY) * perspective;
    xiaoheiAvatar.group.position.set(xiaoheiAvatar.baseX, xiaoheiAvatar.baseY, z);
    xiaoheiAvatarRefreshAnchors();
    var spec = xiaoheiAvatarPose[xiaoheiAvatar.pose] || xiaoheiAvatarPose.idle;
    var poseHeight = height * spec.scale;
    var poseWidth = poseHeight * spec.aspect;
    xiaoheiAvatar.mesh.scale.set(poseWidth, poseHeight, 1);
    xiaoheiAvatar.mesh.position.set((0.5 - spec.pivotX) * poseWidth, (spec.pivotY - 0.5) * poseHeight, 0);
    xiaoheiAvatar.glow.position.set(0, -height * 0.08, -3);
    xiaoheiAvatar.glow.scale.set(height * 0.72, height * 0.92, 1);
  }

  function xiaoheiAvatarBlink(now) {
    if (!xiaoheiAvatar || REDUCED) return;
    if (now >= xiaoheiAvatarNextBlink && xiaoheiAvatarBlinkUntil === 0) {
      xiaoheiAvatarBlinkUntil = now + 118;
      xiaoheiAvatarDoubleBlink = Math.random() < 0.18;
    }
    var closed = xiaoheiAvatar.pose === 'idle' && xiaoheiAvatarBlinkUntil > now;
    if (xiaoheiAvatarBlinkUntil !== 0 && now >= xiaoheiAvatarBlinkUntil) {
      xiaoheiAvatarBlinkUntil = 0;
      if (xiaoheiAvatarDoubleBlink) {
        xiaoheiAvatarDoubleBlink = false;
        xiaoheiAvatarNextBlink = now + 145;
      } else {
        xiaoheiAvatarNextBlink = now + 3400 + Math.random() * 3600;
      }
    }
    if (closed !== xiaoheiAvatar.closed) {
      xiaoheiAvatar.closed = closed;
      xiaoheiAvatar.material.map = closed ? xiaoheiAvatar.blink : xiaoheiAvatar.open;
      xiaoheiAvatar.material.needsUpdate = true;
    }
  }

  function xiaoheiAvatarUpdate() {
    if (!xiaoheiAvatar || !camera) return;
    var now = performance.now();
    var time = now * 0.001;
    xiaoheiAvatarRefreshAnchors();
    var hit = false;
    if (ndc.x <= 2) {
      xiaoheiAvatarRay.setFromCamera(ndc, camera);
      hit = xiaoheiAvatarRay.intersectObject(xiaoheiAvatar.mesh, false).length > 0;
    }
    var hoverGoal = hit ? 1 : 0;
    xiaoheiAvatarHover += (hoverGoal - xiaoheiAvatarHover) * (hit ? 0.16 : 0.075);

    var away = 0;
    if (hit) {
      xiaoheiAvatarRay.ray.intersectPlane(crownPlane, xiaoheiAvatarPointer);
      away = xiaoheiAvatarPointer.x < xiaoheiAvatar.group.position.x ? 1 : -1;
    }
    if (hit && xiaoheiAvatarAction === 'idle' && now + 520 < xiaoheiAvatarNextAction) {
      xiaoheiAvatarNextAction = now + 520;
    }
    if (xiaoheiAvatarAction === 'idle' && now >= xiaoheiAvatarNextAction) xiaoheiAvatarBeginAction(now);

    var progress = xiaoheiAvatarAction === 'idle'
      ? 0
      : Math.min(1, (now - xiaoheiAvatarActionStart) / xiaoheiAvatarActionDuration);
    var eased = progress * progress * (3 - 2 * progress);
    var hasBranch = xiaoheiAvatarBranchPoint(xiaoheiAvatarCurrentAnchor, xiaoheiAvatarFrom);
    var hasTarget = xiaoheiAvatarBranchPoint(xiaoheiAvatarTargetAnchor, xiaoheiAvatarTo);
    if (hasBranch) xiaoheiAvatarAt.copy(xiaoheiAvatarFrom);
    if (hasBranch && hasTarget) {
      if (xiaoheiAvatarAction === 'climb') {
        var sameLimb = xiaoheiAvatarCurrentAnchor.limb === xiaoheiAvatarTargetAnchor.limb;
        if (sameLimb) {
          var route = {
            limb: xiaoheiAvatarCurrentAnchor.limb,
            t: xiaoheiAvatarCurrentAnchor.t + (xiaoheiAvatarTargetAnchor.t - xiaoheiAvatarCurrentAnchor.t) * eased
          };
          xiaoheiAvatarBranchPoint(route, xiaoheiAvatarAt);
        } else xiaoheiAvatarAt.lerp(xiaoheiAvatarTo, eased);
        xiaoheiAvatarAt.y += Math.sin(progress * Math.PI * 6) * 2.0;
      } else if (xiaoheiAvatarAction === 'jump') {
        xiaoheiAvatarAt.lerp(xiaoheiAvatarTo, eased);
        xiaoheiAvatarAt.y += Math.sin(progress * Math.PI) * Math.min(92, 52 + xiaoheiAvatarFrom.distanceTo(xiaoheiAvatarTo) * 0.12);
      } else if (xiaoheiAvatarAction === 'portal') {
        if (progress >= 0.5) xiaoheiAvatarAt.copy(xiaoheiAvatarTo);
        var portalFade = Math.abs(progress - 0.5) * 2;
        xiaoheiAvatar.material.opacity = Math.max(0.02, portalFade);
      }
    }
    if (progress >= 1 && xiaoheiAvatarAction !== 'idle') xiaoheiAvatarFinishAction(now);

    var targetX = away * 7 * ((DIST - xiaoheiAvatar.z) / DIST) * xiaoheiAvatarHover;
    var targetY = 2.5 * ((DIST - xiaoheiAvatar.z) / DIST) * xiaoheiAvatarHover;
    xiaoheiAvatarOffsetX += (targetX - xiaoheiAvatarOffsetX) * 0.085;
    xiaoheiAvatarOffsetY += (targetY - xiaoheiAvatarOffsetY) * 0.085;

    var idleX = REDUCED ? 0 : Math.sin(time * 0.42 + 0.8) * 2.4;
    var idleY = REDUCED ? 0 : Math.sin(time * 0.78) * 1.6;
    var breath = REDUCED ? 0 : Math.sin(time * 1.18) * 0.0035;
    var height = xiaoheiAvatar.height;
    var originX = hasBranch ? xiaoheiAvatarAt.x : xiaoheiAvatar.baseX;
    var originY = hasBranch ? xiaoheiAvatarAt.y : xiaoheiAvatar.baseY;
    var originZ = hasBranch ? xiaoheiAvatarAt.z + 36 : xiaoheiAvatar.z;
    xiaoheiAvatar.group.position.x = originX + idleX + xiaoheiAvatarOffsetX;
    xiaoheiAvatar.group.position.y = originY + idleY + xiaoheiAvatarOffsetY;
    xiaoheiAvatar.group.position.z = originZ;
    xiaoheiAvatar.group.rotation.z = (REDUCED ? 0 : Math.sin(time * 0.34) * 0.006)
      + away * xiaoheiAvatarHover * 0.018;
    var pose = xiaoheiAvatarPose[xiaoheiAvatar.pose] || xiaoheiAvatarPose.idle;
    var poseHeight = height * pose.scale;
    var poseWidth = poseHeight * pose.aspect;
    xiaoheiAvatar.mesh.scale.set(poseWidth * (1 - breath * 0.38), poseHeight * (1 + breath), 1);
    xiaoheiAvatar.mesh.position.set((0.5 - pose.pivotX) * poseWidth, (pose.pivotY - 0.5) * poseHeight, 0);
    xiaoheiAvatar.glow.material.opacity = 0.035 + xiaoheiAvatarHover * 0.12;
    xiaoheiAvatar.glow.scale.x = height * (0.72 + xiaoheiAvatarHover * 0.045);
    xiaoheiAvatar.glow.scale.y = height * (0.92 + xiaoheiAvatarHover * 0.035);
    document.documentElement.dataset.xiaoheiAvatarHover = xiaoheiAvatarHover > 0.08 ? 'true' : 'false';
    xiaoheiAvatarBlink(now);
  }

  var xiaoheiAvatarOriginalLayout = layout;
  layout = function () {
    xiaoheiAvatarOriginalLayout();
    xiaoheiAvatarLayout();
  };

  var xiaoheiAvatarOriginalAssembleRoot = assembleRoot;
  assembleRoot = function (limbs, options) {
    if (!xiaoheiAvatarNearLimbs && options && options.order === 2) xiaoheiAvatarNearLimbs = limbs;
    return xiaoheiAvatarOriginalAssembleRoot(limbs, options);
  };

  var xiaoheiAvatarOriginalRenderFrame = renderFrame;
  renderFrame = function () {
    xiaoheiAvatarUpdate();
    xiaoheiAvatarOriginalRenderFrame();
  };

  var xiaoheiAvatarOriginalBuild = build;
  build = function () {
    xiaoheiAvatarOriginalBuild();
    xiaoheiAvatarBuild();
  };
`

/** Inject the derived model adapter without changing the registered ThreeUI source. */
export function injectXiaoheiSylvaAvatarModel(source: string): string {
  if (source.includes(`${XIAOHEI_SYLVA_AVATAR_MARKER}="true"`)) return source
  const runtimeEnd = source.lastIndexOf('\n})();\n</script>')
  if (runtimeEnd < 0) return source
  return `${source.slice(0, runtimeEnd)}${AVATAR_ADAPTER}${source.slice(runtimeEnd)}`
}

/** Prepare the detached iframe so the model exists on its first WebGL boot. */
export function prepareXiaoheiSylvaAvatarFrame(frame: HTMLIFrameElement): boolean {
  const source = frame.getAttribute('srcdoc')
  if (source === null) return false
  const modeledSource = injectXiaoheiSylvaAvatarModel(source)
  if (modeledSource === source && !source.includes(`${XIAOHEI_SYLVA_AVATAR_MARKER}="true"`)) return false
  frame.dataset.xiaoheiAvatarModel = 'true'
  if (modeledSource !== source) frame.setAttribute('srcdoc', modeledSource)
  return true
}
