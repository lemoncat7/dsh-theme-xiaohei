/** Runtime helpers inserted beside the Xiaohei model in ThreeUI's own r149 scene. */
export const XIAOHEI_AVATAR_MOTION_RUNTIME = `
  function xiaoheiMotionSmoothstep(a, b, value) {
    var t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function xiaoheiMotionEase(value) {
    var t = Math.max(0, Math.min(1, value));
    return 1 - Math.pow(1 - t, 3);
  }

  function xiaoheiAvatarBuildRig(geometry, height) {
    var bones = {
      root: new THREE.Bone(),
      pelvis: new THREE.Bone(),
      torso: new THREE.Bone(),
      head: new THREE.Bone(),
      leftArm: new THREE.Bone(),
      rightArm: new THREE.Bone(),
      leftLeg: new THREE.Bone(),
      rightLeg: new THREE.Bone()
    };
    bones.root.name = 'xiaohei-rig-root';
    bones.pelvis.name = 'xiaohei-rig-pelvis';
    bones.torso.name = 'xiaohei-rig-torso';
    bones.head.name = 'xiaohei-rig-head';
    bones.leftArm.name = 'xiaohei-rig-arm-left';
    bones.rightArm.name = 'xiaohei-rig-arm-right';
    bones.leftLeg.name = 'xiaohei-rig-leg-left';
    bones.rightLeg.name = 'xiaohei-rig-leg-right';

    bones.root.add(bones.pelvis);
    bones.pelvis.position.set(0, height * 0.27, 0);
    bones.pelvis.add(bones.torso, bones.leftLeg, bones.rightLeg);
    bones.torso.position.set(0, height * 0.17, 0);
    bones.torso.add(bones.head, bones.leftArm, bones.rightArm);
    bones.head.position.set(0, height * 0.19, 0);
    bones.leftArm.position.set(-height * 0.115, height * 0.065, 0);
    bones.rightArm.position.set(height * 0.115, height * 0.065, 0);
    bones.leftLeg.position.set(-height * 0.055, 0, 0);
    bones.rightLeg.position.set(height * 0.055, 0, 0);

    var ordered = [
      bones.root,
      bones.pelvis,
      bones.torso,
      bones.head,
      bones.leftArm,
      bones.rightArm,
      bones.leftLeg,
      bones.rightLeg
    ];
    var position = geometry.getAttribute('position');
    var skinIndex = new Uint16Array(position.count * 4);
    var skinWeight = new Float32Array(position.count * 4);
    var halfWidth = height * 0.235;

    function weightPair(vertex, firstIndex, firstWeight, secondIndex) {
      var offset = vertex * 4;
      skinIndex[offset] = firstIndex;
      skinIndex[offset + 1] = secondIndex;
      skinWeight[offset] = firstWeight;
      skinWeight[offset + 1] = 1 - firstWeight;
    }

    for (var vertex = 0; vertex < position.count; vertex += 1) {
      var x = position.getX(vertex) / halfWidth;
      var y = position.getY(vertex) / height;
      var headWeight = xiaoheiMotionSmoothstep(0.53, 0.67, y);
      var legWeight = 1 - xiaoheiMotionSmoothstep(0.23, 0.38, y);
      var armWeight = xiaoheiMotionSmoothstep(0.38, 0.76, Math.abs(x))
        * (1 - xiaoheiMotionSmoothstep(0.55, 0.66, y))
        * xiaoheiMotionSmoothstep(0.25, 0.34, y);

      if (headWeight > 0.04) {
        weightPair(vertex, 3, headWeight, 2);
      } else if (legWeight > 0.04) {
        weightPair(vertex, x < 0 ? 6 : 7, legWeight, 1);
      } else if (armWeight > 0.04) {
        weightPair(vertex, x < 0 ? 4 : 5, armWeight, 2);
      } else {
        var torsoWeight = xiaoheiMotionSmoothstep(0.30, 0.48, y);
        weightPair(vertex, 2, torsoWeight, 1);
      }
    }

    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
    var skeleton = new THREE.Skeleton(ordered);
    return {
      rootBone: bones.root,
      skeleton: skeleton,
      bones: bones,
      rest: {
        pelvisY: bones.pelvis.position.y,
        torsoY: bones.torso.position.y,
        headY: bones.head.position.y
      }
    };
  }

  function xiaoheiAvatarBuildPortal() {
    var material = new THREE.MeshBasicMaterial({
      color: 0x6ec4a5,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    });
    var portal = new THREE.Mesh(new THREE.RingGeometry(0.82, 1.05, 48), material);
    portal.name = 'xiaohei-spirit-transit-ring-v1';
    portal.position.set(0, 0.12, 0.08);
    portal.scale.set(1.0, 0.30, 1.0);
    portal.renderOrder = 11;
    portal.frustumCulled = false;
    portal.visible = false;
    return portal;
  }

  function xiaoheiAvatarPrepareMotion(avatar) {
    avatar.motion = {
      action: 'idle',
      actionStarted: 0,
      anchorT: 0.42,
      targetT: 0.42,
      relocated: false,
      nextTransit: performance.now() + 8200
    };
  }

  function xiaoheiAvatarStartArrival(avatar, now) {
    if (!avatar.motion || avatar.motion.action !== 'idle') return;
    avatar.motion.action = 'arrival';
    avatar.motion.actionStarted = now;
    document.documentElement.dataset.xiaoheiAvatarAction = 'arrival-settle';
  }

  function xiaoheiAvatarAdvanceMotion(avatar, now) {
    var motion = avatar.motion;
    if (!motion) return;
    if (motion.action === 'idle' && !scanning && now >= motion.nextTransit && xiaoheiAvatarHover < 0.08) {
      motion.action = 'transit';
      motion.actionStarted = now;
      motion.targetT = motion.anchorT < 0.45 ? 0.53 : 0.36;
      motion.relocated = false;
      document.documentElement.dataset.xiaoheiAvatarAction = 'spirit-transit';
    }
    if (motion.action === 'transit') {
      var transitPhase = (now - motion.actionStarted) / 1000;
      if (transitPhase >= 0.55 && !motion.relocated) {
        motion.anchorT = motion.targetT;
        motion.relocated = true;
      }
      if (transitPhase >= 1.34) {
        motion.action = 'idle';
        motion.actionStarted = now;
        motion.nextTransit = now + 24000 + Math.random() * 14000;
        document.documentElement.dataset.xiaoheiAvatarAction = 'idle-3d';
      }
    } else if (motion.action === 'arrival' && now - motion.actionStarted >= 780) {
      motion.action = 'idle';
      motion.actionStarted = now;
      document.documentElement.dataset.xiaoheiAvatarAction = 'idle-3d';
    }
  }

  function xiaoheiAvatarPoseMotion(avatar, now) {
    var motion = avatar.motion;
    var rig = avatar.rig;
    if (!motion || !rig) return;
    var bones = rig.bones;
    var rest = rig.rest;
    var seconds = now * 0.001;
    var breath = Math.sin(seconds * 1.35);
    var quiet = Math.sin(seconds * 0.47 + 0.8);
    var gaze = xiaoheiAvatarHover;

    bones.pelvis.position.y = rest.pelvisY + breath * avatar.reviewedHeight * 0.0022;
    bones.torso.position.y = rest.torsoY;
    bones.head.position.y = rest.headY;
    bones.pelvis.rotation.set(0, 0, quiet * 0.004);
    bones.torso.rotation.set(0, 0, -quiet * 0.006);
    bones.head.rotation.set(
      (ndc.y <= 2 ? -ndc.y : 0) * gaze * 0.055,
      (ndc.x <= 2 ? ndc.x : 0) * gaze * 0.15,
      quiet * 0.012 - gaze * 0.012
    );
    bones.leftArm.rotation.set(0, 0, 0.018 + breath * 0.008 - gaze * 0.018);
    bones.rightArm.rotation.set(0, 0, -0.018 - breath * 0.008 + gaze * 0.018);
    bones.leftLeg.rotation.set(0, 0, 0);
    bones.rightLeg.rotation.set(0, 0, 0);
    avatar.model.position.y = 0;
    avatar.model.scale.set(1, 1, 1);

    var portalOpacity = 0;
    if (motion.action === 'arrival') {
      var arrival = Math.max(0, Math.min(1, (now - motion.actionStarted) / 780));
      var settle = Math.sin(arrival * Math.PI) * (1 - arrival);
      bones.pelvis.position.y -= settle * avatar.reviewedHeight * 0.018;
      bones.leftLeg.rotation.z = settle * 0.065;
      bones.rightLeg.rotation.z = -settle * 0.065;
    } else if (motion.action === 'transit') {
      var phase = (now - motion.actionStarted) / 1000;
      var fold = 1;
      if (phase < 0.55) fold = 1 - xiaoheiMotionEase((phase - 0.18) / 0.37) * 0.96;
      else if (phase < 0.88) fold = 0.04 + xiaoheiMotionEase((phase - 0.55) / 0.33) * 0.96;
      var crouch = phase < 0.32 ? Math.sin(Math.max(0, phase / 0.32) * Math.PI) : 0;
      avatar.model.scale.set(0.30 + fold * 0.70, fold, 0.30 + fold * 0.70);
      bones.pelvis.position.y -= crouch * avatar.reviewedHeight * 0.018;
      bones.leftLeg.rotation.z = crouch * 0.08;
      bones.rightLeg.rotation.z = -crouch * 0.08;
      portalOpacity = phase < 0.58
        ? Math.sin(Math.max(0, Math.min(1, phase / 0.58)) * Math.PI)
        : Math.sin(Math.max(0, Math.min(1, (phase - 0.50) / 0.70)) * Math.PI);
    }

    if (avatar.portal) {
      avatar.portal.material.opacity = portalOpacity * 0.56;
      avatar.portal.visible = portalOpacity > 0.015;
      avatar.portal.rotation.z = seconds * 0.34;
      var pulse = 1 + portalOpacity * 0.09;
      avatar.portal.scale.set(pulse, 0.30 * pulse, 1);
    }
  }
`
