import {
  XIAOHEI_AVATAR_2D_BLINK,
  XIAOHEI_AVATAR_2D_FRONT,
} from '../generated-keyart.js'

export const XIAOHEI_SYLVA_AVATAR_MARKER = 'data-xiaohei-avatar-model'

/**
 * A camera-facing 2.5D character that lives inside ThreeUI's renderer. The
 * authored root world still owns depth and contact, while complete-frame art
 * keeps Xiaohei's proportions and face faithful to the reviewed illustration.
 */
const AVATAR_ADAPTER = `
  /* ${XIAOHEI_SYLVA_AVATAR_MARKER}="true" */
  var xiaoheiAvatarArt = {
    base: ${JSON.stringify(XIAOHEI_AVATAR_2D_FRONT)},
    blink: ${JSON.stringify(XIAOHEI_AVATAR_2D_BLINK)}
  };
  var xiaoheiAvatar = null;
  var xiaoheiAvatarHostGroup = null;
  var xiaoheiAvatarHostLimbs = null;
  var xiaoheiAvatarPoint = new THREE.Vector3();
  var xiaoheiAvatarCameraLocal = new THREE.Vector3();
  var xiaoheiAvatarRay = new THREE.Raycaster();
  var xiaoheiAvatarHover = 0;

  function xiaoheiAvatarSmoothstep(value) {
    var t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function xiaoheiAvatarConfigureTexture(texture, columns) {
    texture.encoding = THREE.sRGBEncoding;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.repeat.set(1 / columns, 1);
    texture.offset.set(0, 0);
    texture.needsUpdate = true;
    return texture;
  }

  function xiaoheiAvatarLoadTexture(source, columns, ready) {
    return new THREE.TextureLoader().load(
      source,
      function (texture) {
        xiaoheiAvatarConfigureTexture(texture, columns);
        if (ready) ready(texture);
        renderFrame();
      },
      undefined,
      function () {
        document.documentElement.dataset.xiaoheiAvatarTexture = 'load-failed';
      }
    );
  }

  function xiaoheiAvatarUseFrame(avatar, texture, columns, frame) {
    if (!texture || !texture.image) return;
    var safeFrame = Math.max(0, Math.min(columns - 1, frame | 0));
    texture.repeat.x = 1 / columns;
    texture.offset.x = safeFrame / columns;
    if (avatar.headMaterial.map !== texture) {
      avatar.headMaterial.map = texture;
      avatar.headMaterial.needsUpdate = true;
    }
  }

  function xiaoheiAvatarUseBaseTexture(avatar, texture) {
    avatar.materials.forEach(function (material) {
      material.map = texture;
      material.needsUpdate = true;
    });
  }

  function xiaoheiAvatarBuildIllustratedRig() {
    var bones = {
      root: new THREE.Bone(),
      torso: new THREE.Bone(),
      head: new THREE.Bone(),
      upperArmLeft: new THREE.Bone(),
      foreArmLeft: new THREE.Bone(),
      handLeft: new THREE.Bone(),
      upperArmRight: new THREE.Bone(),
      foreArmRight: new THREE.Bone(),
      handRight: new THREE.Bone(),
      pelvis: new THREE.Bone(),
      upperLegLeft: new THREE.Bone(),
      lowerLegLeft: new THREE.Bone(),
      footLeft: new THREE.Bone(),
      upperLegRight: new THREE.Bone(),
      lowerLegRight: new THREE.Bone(),
      footRight: new THREE.Bone()
    };
    var ordered = [
      bones.root,
      bones.torso,
      bones.head,
      bones.upperArmLeft,
      bones.foreArmLeft,
      bones.handLeft,
      bones.upperArmRight,
      bones.foreArmRight,
      bones.handRight,
      bones.pelvis,
      bones.upperLegLeft,
      bones.lowerLegLeft,
      bones.footLeft,
      bones.upperLegRight,
      bones.lowerLegRight,
      bones.footRight
    ];
    ordered.forEach(function (bone, index) {
      bone.name = 'xiaohei-2d-bone-' + index;
    });

    bones.root.add(bones.pelvis);
    bones.pelvis.position.set(0, 0.285, 0);
    bones.pelvis.add(bones.torso, bones.upperLegLeft, bones.upperLegRight);
    bones.torso.position.set(0, 0.155, 0);
    bones.torso.add(bones.head, bones.upperArmLeft, bones.upperArmRight);
    bones.head.position.set(0, 0.13, 0);
    bones.upperArmLeft.position.set(-0.125, 0.105, 0);
    bones.upperArmRight.position.set(0.125, 0.105, 0);
    bones.upperArmLeft.add(bones.foreArmLeft);
    bones.foreArmLeft.position.set(-0.12, -0.02, 0);
    bones.foreArmLeft.add(bones.handLeft);
    bones.handLeft.position.set(-0.09, -0.015, 0);
    bones.upperArmRight.add(bones.foreArmRight);
    bones.foreArmRight.position.set(0.12, -0.02, 0);
    bones.foreArmRight.add(bones.handRight);
    bones.handRight.position.set(0.09, -0.015, 0);
    bones.upperLegLeft.position.set(-0.065, -0.015, 0);
    bones.upperLegRight.position.set(0.065, -0.015, 0);
    bones.upperLegLeft.add(bones.lowerLegLeft);
    bones.lowerLegLeft.position.set(0, -0.115, 0);
    bones.lowerLegLeft.add(bones.footLeft);
    bones.footLeft.position.set(0, -0.105, 0);
    bones.upperLegRight.add(bones.lowerLegRight);
    bones.lowerLegRight.position.set(0, -0.115, 0);
    bones.lowerLegRight.add(bones.footRight);
    bones.footRight.position.set(0, -0.105, 0);

    return {
      root: bones.root,
      bones: bones,
      skeleton: new THREE.Skeleton(ordered),
      rest: {
        torsoY: bones.torso.position.y,
        headY: bones.head.position.y,
        pelvisY: bones.pelvis.position.y
      }
    };
  }

  function xiaoheiAvatarBuildPartGeometry(bounds, pivot, segmentsX, segmentsY) {
    var width = bounds[1] - bounds[0];
    var height = bounds[3] - bounds[2];
    var geometry = new THREE.PlaneGeometry(
      width,
      height,
      segmentsX || 1,
      segmentsY || 1
    );
    geometry.translate(
      (bounds[0] + bounds[1]) * 0.5 - pivot[0],
      (bounds[2] + bounds[3]) * 0.5 - pivot[1],
      0
    );
    var uv = geometry.getAttribute('uv');
    for (var vertex = 0; vertex < uv.count; vertex += 1) {
      uv.setXY(
        vertex,
        bounds[0] + 0.5 + uv.getX(vertex) * width,
        bounds[2] + uv.getY(vertex) * height
      );
    }
    uv.needsUpdate = true;
    return geometry;
  }

  function xiaoheiAvatarBuildPart(bone, definition, materials, hitMeshes) {
    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      alphaTest: 0.026,
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    material.toneMapped = false;
    var geometry = xiaoheiAvatarBuildPartGeometry(
      definition.bounds,
      definition.pivot,
      definition.segmentsX,
      definition.segmentsY
    );
    var mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'xiaohei-avatar-part-' + definition.name;
    mesh.position.z = definition.depth || 0;
    mesh.renderOrder = definition.order;
    mesh.frustumCulled = false;
    bone.add(mesh);
    materials.push(material);
    hitMeshes.push(mesh);
    return mesh;
  }

  function xiaoheiAvatarBuildSkinnedPart(model, rig, definition, materials, hitMeshes) {
    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      alphaTest: 0.026,
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    material.toneMapped = false;
    var geometry = xiaoheiAvatarBuildPartGeometry(
      definition.bounds,
      [0, 0],
      definition.segmentsX,
      definition.segmentsY
    );
    var position = geometry.getAttribute('position');
    var skinIndex = new Uint16Array(position.count * 4);
    var skinWeight = new Float32Array(position.count * 4);
    for (var vertex = 0; vertex < position.count; vertex += 1) {
      var along = definition.axis === 'x'
        ? (position.getX(vertex) - definition.origin) * definition.direction
        : (definition.origin - position.getY(vertex));
      var first = definition.chain[0];
      var second = first;
      var firstWeight = 1;
      if (along > definition.joints[1] - definition.blend) {
        first = definition.chain[2];
        second = definition.chain[1];
        firstWeight = xiaoheiAvatarSmoothstep(
          (along - definition.joints[1] + definition.blend) / (definition.blend * 2)
        );
      } else if (along > definition.joints[0] - definition.blend) {
        first = definition.chain[1];
        second = definition.chain[0];
        firstWeight = xiaoheiAvatarSmoothstep(
          (along - definition.joints[0] + definition.blend) / (definition.blend * 2)
        );
      }
      var offset = vertex * 4;
      skinIndex[offset] = first;
      skinIndex[offset + 1] = second;
      skinWeight[offset] = firstWeight;
      skinWeight[offset + 1] = 1 - firstWeight;
    }
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
    var mesh = new THREE.SkinnedMesh(geometry, material);
    mesh.name = 'xiaohei-avatar-part-' + definition.name;
    mesh.position.z = definition.depth || 0;
    mesh.renderOrder = definition.order;
    mesh.frustumCulled = false;
    mesh.bind(rig.skeleton);
    model.add(mesh);
    materials.push(material);
    hitMeshes.push(mesh);
    return mesh;
  }

  function xiaoheiAvatarUpdateRig(avatar, now) {
    var bones = avatar.rig.bones;
    var rest = avatar.rig.rest;
    var seconds = (now - avatar.motionStarted) * 0.001;
    var breath = REDUCED ? 0 : Math.sin(seconds * 1.72);
    var slow = REDUCED ? 0 : Math.sin(seconds * 0.63 + 0.8);
    var delayed = REDUCED ? 0 : Math.sin(seconds * 1.72 - 0.34);

    /* The source illustration is a T pose. Rotate the complete painted sleeve,
       cuff and hand regions as one articulated chain so clothing never floats
       away from the limb it belongs to. */
    bones.root.rotation.set(0, 0, 0);
    bones.root.position.set(0, 0, 0);
    bones.torso.position.y = rest.torsoY + breath * 0.0022;
    bones.torso.rotation.set(0, 0, slow * 0.008);
    bones.torso.scale.set(1, 1 + breath * 0.0035, 1);
    bones.head.position.y = rest.headY;
    bones.head.rotation.set(0, 0, -slow * 0.014 + delayed * 0.004);

    bones.upperArmLeft.rotation.set(0, 0, 1.39 + breath * 0.012 + slow * 0.008);
    bones.foreArmLeft.rotation.set(0, 0, -0.075 + delayed * 0.009);
    bones.handLeft.rotation.set(0, 0, 0.035 - delayed * 0.012);
    bones.upperArmRight.rotation.set(0, 0, -1.39 - breath * 0.012 + slow * 0.008);
    bones.foreArmRight.rotation.set(0, 0, 0.075 - delayed * 0.009);
    bones.handRight.rotation.set(0, 0, -0.035 + delayed * 0.012);

    bones.pelvis.position.y = rest.pelvisY;
    bones.pelvis.rotation.set(0, 0, -slow * 0.004);
    bones.upperLegLeft.rotation.set(0, 0, slow * 0.006);
    bones.lowerLegLeft.rotation.set(0, 0, -slow * 0.004);
    bones.footLeft.rotation.set(0, 0, -slow * 0.002);
    bones.upperLegRight.rotation.set(0, 0, slow * 0.006);
    bones.lowerLegRight.rotation.set(0, 0, -slow * 0.004);
    bones.footRight.rotation.set(0, 0, -slow * 0.002);
    bones.root.updateMatrixWorld(true);
  }

  function xiaoheiAvatarBuildModel() {
    var root = new THREE.Group();
    root.name = 'xiaohei-avatar-2-5d-root-v1';
    var model = new THREE.Group();
    model.name = 'xiaohei-avatar-2-5d-model-v1';
    root.add(model);

    var rig = xiaoheiAvatarBuildIllustratedRig();
    var materials = [];
    var hitMeshes = [];
    model.add(rig.root);
    rig.root.updateMatrixWorld(true);

    var parts = {};
    parts.armLeft = xiaoheiAvatarBuildSkinnedPart(model, rig, {
      name: 'arm-left-with-sleeve', bounds: [-0.42, -0.105, 0.425, 0.62],
      axis: 'x', origin: -0.125, direction: -1, chain: [3, 4, 5],
      joints: [0.12, 0.21], blend: 0.025,
      order: 4, segmentsX: 24, segmentsY: 8
    }, materials, hitMeshes);
    parts.armRight = xiaoheiAvatarBuildSkinnedPart(model, rig, {
      name: 'arm-right-with-sleeve', bounds: [0.105, 0.42, 0.425, 0.62],
      axis: 'x', origin: 0.125, direction: 1, chain: [6, 7, 8],
      joints: [0.12, 0.21], blend: 0.025,
      order: 4, segmentsX: 24, segmentsY: 8
    }, materials, hitMeshes);
    parts.legLeft = xiaoheiAvatarBuildSkinnedPart(model, rig, {
      name: 'leg-left-with-shoe', bounds: [-0.175, -0.005, 0.0, 0.32],
      axis: 'y', origin: 0.27, direction: 1, chain: [10, 11, 12],
      joints: [0.115, 0.22], blend: 0.022,
      order: 3, segmentsX: 8, segmentsY: 24
    }, materials, hitMeshes);
    parts.legRight = xiaoheiAvatarBuildSkinnedPart(model, rig, {
      name: 'leg-right-with-shoe', bounds: [0.005, 0.175, 0.0, 0.32],
      axis: 'y', origin: 0.27, direction: 1, chain: [13, 14, 15],
      joints: [0.115, 0.22], blend: 0.022,
      order: 3, segmentsX: 8, segmentsY: 24
    }, materials, hitMeshes);
    parts.torso = xiaoheiAvatarBuildPart(rig.bones.torso, {
      name: 'torso-clothing', bounds: [-0.19, 0.19, 0.225, 0.65],
      pivot: [0, 0.44], order: 6
    }, materials, hitMeshes);
    parts.head = xiaoheiAvatarBuildPart(rig.bones.head, {
      name: 'head', bounds: [-0.265, 0.265, 0.555, 1.0],
      pivot: [0, 0.57], order: 8, segmentsX: 24, segmentsY: 24, depth: 0.006
    }, materials, hitMeshes);
    var basePositions = parts.head.geometry.getAttribute('position').array.slice();

    var scanMaterial = new THREE.MeshBasicMaterial({
      color: 0x9bf1c9,
      transparent: true,
      opacity: 0,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    scanMaterial.toneMapped = false;
    var scanLine = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.012), scanMaterial);
    scanLine.name = 'xiaohei-avatar-scan-line-v1';
    scanLine.position.set(-0.02, 0.02, 0.024);
    scanLine.renderOrder = 10;
    model.add(scanLine);

    var avatar = {
      root: root,
      model: model,
      rig: rig,
      parts: parts,
      headMesh: parts.head,
      headMaterial: parts.head.material,
      materials: materials,
      hitMeshes: hitMeshes,
      basePositions: basePositions,
      scanLine: scanLine,
      scanMaterial: scanMaterial,
      textures: {},
      ready: false,
      builtAt: performance.now(),
      motionStarted: performance.now(),
      anchorT: 0.38,
      reaction: '',
      reactionStarted: 0,
      reactionUntil: 0,
      hoverEar: '',
      earLeftAmount: 0,
      earRightAmount: 0,
      nextBlink: performance.now() + 3200 + Math.random() * 2600,
      blinkUntil: 0,
      nextEar: performance.now() + 8000 + Math.random() * 9000
    };

    avatar.textures.base = xiaoheiAvatarLoadTexture(xiaoheiAvatarArt.base, 1, function (texture) {
      avatar.ready = true;
      avatar.builtAt = performance.now();
      xiaoheiAvatarUseBaseTexture(avatar, texture);
      xiaoheiAvatarUseFrame(avatar, texture, 1, 0);
      document.documentElement.dataset.xiaoheiAvatarTexture = 'illustrated-2-5d-v1';
      document.documentElement.dataset.xiaoheiAvatarScan = REDUCED ? 'skipped' : 'active';
    });
    avatar.textures.blink = xiaoheiAvatarLoadTexture(xiaoheiAvatarArt.blink, 1);
    return avatar;
  }

  function xiaoheiAvatarSampleAt(t, target) {
    if (!xiaoheiAvatarHostLimbs || !xiaoheiAvatarHostLimbs[0]) return false;
    var limb = xiaoheiAvatarHostLimbs[0];
    if (limb.grid && limb.S && limb.R) {
      var row = Math.max(0, Math.min(limb.S, t * limb.S));
      var row0 = Math.min(limb.S - 1, Math.floor(row));
      var row1 = Math.min(limb.S, row0 + 1);
      var blend = row - row0;
      var stride = limb.R + 1;
      var highestY = -Infinity;
      for (var ringIndex = 0; ringIndex < limb.R; ringIndex += 1) {
        var offset0 = (row0 * stride + ringIndex) * 3;
        var offset1 = (row1 * stride + ringIndex) * 3;
        var surfaceY = limb.grid[offset0 + 1]
          + (limb.grid[offset1 + 1] - limb.grid[offset0 + 1]) * blend;
        if (surfaceY <= highestY) continue;
        highestY = surfaceY;
        target.set(
          limb.grid[offset0] + (limb.grid[offset1] - limb.grid[offset0]) * blend,
          surfaceY + 0.018,
          limb.grid[offset0 + 2]
            + (limb.grid[offset1 + 2] - limb.grid[offset0 + 2]) * blend
        );
      }
      return highestY > -Infinity;
    }
    target.copy(limb.curve.getPointAt(t));
    var moss = limb.moss ? limb.moss(t) : 0;
    var radius = limb.rw(t) + moss * 0.52;
    if (limb.sink) target.y -= moss * limb.sink;
    target.y += radius + 0.02;
    return true;
  }

  function xiaoheiAvatarBeginReaction(avatar, reaction, now, duration) {
    if (avatar.reaction && now < avatar.reactionUntil) return;
    avatar.reaction = reaction;
    avatar.reactionStarted = now;
    avatar.reactionUntil = now + duration;
    document.documentElement.dataset.xiaoheiAvatarAction = reaction + '-2-5d';
  }

  function xiaoheiAvatarUpdatePointer(avatar, now) {
    var hit = null;
    if (avatar.ready && ndc.x >= -1.2 && ndc.x <= 1.2 && ndc.y >= -1.2 && ndc.y <= 1.2) {
      xiaoheiAvatarRay.setFromCamera(ndc, camera);
      var intersections = xiaoheiAvatarRay.intersectObjects(avatar.hitMeshes, false);
      if (intersections.length) hit = intersections[0];
    }
    xiaoheiAvatarHover += ((hit ? 1 : 0) - xiaoheiAvatarHover) * (hit ? 0.16 : 0.08);
    var ear = '';
    if (hit && hit.uv) {
      var leftDistance = Math.hypot(
        (hit.uv.x - 0.35) / 0.11,
        (hit.uv.y - 0.85) / 0.16
      );
      var rightDistance = Math.hypot(
        (hit.uv.x - 0.64) / 0.11,
        (hit.uv.y - 0.84) / 0.16
      );
      if (leftDistance <= 1 || rightDistance <= 1) {
        ear = leftDistance <= rightDistance ? 'ear-left' : 'ear-right';
      }
    }
    if (ear && ear !== avatar.hoverEar && now >= avatar.reactionUntil) {
      xiaoheiAvatarBeginReaction(avatar, ear, now, 560);
    }
    avatar.hoverEar = ear;
    document.documentElement.dataset.xiaoheiAvatarHover = xiaoheiAvatarHover > 0.08 ? 'true' : 'false';
  }

  function xiaoheiAvatarDeformEar(avatar, centerU, centerV, pivotU, pivotV, amount) {
    if (Math.abs(amount) < 0.0001) return;
    var position = avatar.headMesh.geometry.getAttribute('position');
    var uv = avatar.headMesh.geometry.getAttribute('uv');
    for (var vertex = 0; vertex < position.count; vertex += 1) {
      var du = (uv.getX(vertex) - centerU) / 0.13;
      var dv = (uv.getY(vertex) - centerV) / 0.18;
      var distance = Math.hypot(du, dv);
      if (distance >= 1) continue;
      var influence = xiaoheiAvatarSmoothstep(1 - distance);
      var angle = amount * influence;
      var x = position.getX(vertex) - (pivotU - 0.5);
      var localPivotY = pivotV - 0.57;
      var y = position.getY(vertex) - localPivotY;
      var cosine = Math.cos(angle);
      var sine = Math.sin(angle);
      position.setXY(
        vertex,
        x * cosine - y * sine + pivotU - 0.5,
        x * sine + y * cosine + localPivotY
      );
    }
  }

  function xiaoheiAvatarUpdateEars(avatar) {
    var position = avatar.headMesh.geometry.getAttribute('position');
    position.array.set(avatar.basePositions);
    xiaoheiAvatarDeformEar(avatar, 0.35, 0.85, 0.39, 0.73, avatar.earLeftAmount * 0.12);
    xiaoheiAvatarDeformEar(avatar, 0.64, 0.84, 0.60, 0.73, avatar.earRightAmount * -0.12);
    position.needsUpdate = true;
  }

  function xiaoheiAvatarUpdateVisual(avatar, now) {
    var blinking = now < avatar.blinkUntil;
    if (!REDUCED && !avatar.reaction && now >= avatar.nextBlink) {
      avatar.blinkUntil = now + 135;
      avatar.nextBlink = now + 3800 + Math.random() * 3600;
      blinking = true;
    }
    if (!REDUCED && !avatar.reaction && now >= avatar.nextEar) {
      xiaoheiAvatarBeginReaction(
        avatar,
        Math.random() < 0.5 ? 'ear-left' : 'ear-right',
        now,
        620
      );
      avatar.nextEar = now + 8000 + Math.random() * 9000;
    }

    if (avatar.reaction && now >= avatar.reactionUntil) {
      avatar.reaction = '';
      document.documentElement.dataset.xiaoheiAvatarAction = 'idle-2-5d';
    }

    avatar.earLeftAmount = 0;
    avatar.earRightAmount = 0;
    if (avatar.reaction) {
      var reactionProgress = Math.max(0, Math.min(0.999,
        (now - avatar.reactionStarted) / (avatar.reactionUntil - avatar.reactionStarted)
      ));
      var earPulse = Math.sin(reactionProgress * Math.PI)
        * Math.sin(reactionProgress * Math.PI * 2.5);
      if (avatar.reaction === 'ear-left') {
        avatar.earLeftAmount = earPulse;
      } else if (avatar.reaction === 'ear-right') {
        avatar.earRightAmount = earPulse;
      }
    }
    if (blinking) {
      xiaoheiAvatarUseFrame(avatar, avatar.textures.blink, 1, 0);
    } else {
      xiaoheiAvatarUseFrame(avatar, avatar.textures.base, 1, 0);
    }
    xiaoheiAvatarUpdateEars(avatar);
  }

  function xiaoheiAvatarBuild() {
    if (!xiaoheiAvatarHostGroup || !xiaoheiAvatarHostLimbs || xiaoheiAvatar) return;
    xiaoheiAvatar = xiaoheiAvatarBuildModel();
    xiaoheiAvatarHostGroup.add(xiaoheiAvatar.root);
    xiaoheiAvatarSampleAt(xiaoheiAvatar.anchorT, xiaoheiAvatarPoint);
    xiaoheiAvatar.root.position.copy(xiaoheiAvatarPoint);
    document.documentElement.dataset.xiaoheiAvatarReady = 'true';
    document.documentElement.dataset.xiaoheiAvatarMotion = 'illustrated-2-5d-v1';
    document.documentElement.dataset.xiaoheiAvatarAction = 'idle-2-5d';
    document.documentElement.dataset.xiaoheiAvatarPose = 'idle';
    renderFrame();
  }

  function xiaoheiAvatarUpdate() {
    if (!xiaoheiAvatar || !camera || !xiaoheiAvatarHostGroup) return;
    var avatar = xiaoheiAvatar;
    var now = performance.now();
    xiaoheiAvatarSampleAt(avatar.anchorT, xiaoheiAvatarPoint);
    avatar.root.position.copy(xiaoheiAvatarPoint);
    var displayHeight = NARROW.matches ? 2.08 : 1.72;
    avatar.model.scale.setScalar(displayHeight);
    avatar.model.position.y = 0;

    xiaoheiAvatarCameraLocal.copy(camera.position);
    xiaoheiAvatarHostGroup.worldToLocal(xiaoheiAvatarCameraLocal);
    var cameraDx = xiaoheiAvatarCameraLocal.x - xiaoheiAvatarPoint.x;
    var cameraDz = xiaoheiAvatarCameraLocal.z - xiaoheiAvatarPoint.z;
    avatar.model.rotation.y = Math.atan2(cameraDx, cameraDz);

    if (avatar.ready) {
      var reveal = REDUCED ? 1 : xiaoheiAvatarSmoothstep((now - avatar.builtAt) / 860);
      avatar.materials.forEach(function (material) {
        material.opacity = reveal;
      });
      avatar.scanLine.visible = reveal < 0.995 && !REDUCED;
      avatar.scanLine.position.y = 0.04 + reveal * 0.80;
      avatar.scanMaterial.opacity = Math.sin(reveal * Math.PI) * 0.42;
      if (reveal >= 0.995 && document.documentElement.dataset.xiaoheiAvatarScan !== 'complete') {
        document.documentElement.dataset.xiaoheiAvatarScan = 'complete';
      }
      xiaoheiAvatarUpdatePointer(avatar, now);
      xiaoheiAvatarUpdateVisual(avatar, now);
      xiaoheiAvatarUpdateRig(avatar, now);
    }
  }

  var xiaoheiAvatarOriginalAssembleRoot = assembleRoot;
  assembleRoot = function (limbs, options) {
    var group = xiaoheiAvatarOriginalAssembleRoot(limbs, options);
    if (options && options.order === 0) {
      xiaoheiAvatarHostLimbs = limbs;
      xiaoheiAvatarHostGroup = group;
    }
    return group;
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

/** Inject the renderer-sharing 2.5D avatar without editing registered ThreeUI files. */
export function injectXiaoheiSylvaAvatarModel(source: string): string {
  if (source.includes(`${XIAOHEI_SYLVA_AVATAR_MARKER}="true"`)) return source
  const runtimeEnd = source.lastIndexOf('\n})();\n</script>')
  if (runtimeEnd < 0) return source
  return `${source.slice(0, runtimeEnd)}${AVATAR_ADAPTER}${source.slice(runtimeEnd)}`
}

/** Prepare the detached iframe so the avatar exists on its first WebGL boot. */
export function prepareXiaoheiSylvaAvatarFrame(frame: HTMLIFrameElement): boolean {
  const source = frame.getAttribute('srcdoc')
  if (source === null) return false
  const modeledSource = injectXiaoheiSylvaAvatarModel(source)
  if (modeledSource === source && !source.includes(`${XIAOHEI_SYLVA_AVATAR_MARKER}="true"`)) {
    return false
  }
  frame.dataset.xiaoheiAvatarModel = 'true'
  if (modeledSource !== source) frame.setAttribute('srcdoc', modeledSource)
  return true
}
