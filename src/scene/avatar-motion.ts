/** Runtime helpers inserted beside the Xiaohei model in ThreeUI's own r149 scene. */
export const XIAOHEI_AVATAR_MOTION_RUNTIME = `
  function xiaoheiMotionSmoothstep(a, b, value) {
    var t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function xiaoheiAvatarBuildRig(geometry, height) {
    var bones = {
      root: new THREE.Bone(),
      pelvis: new THREE.Bone(),
      spine: new THREE.Bone(),
      chest: new THREE.Bone(),
      neck: new THREE.Bone(),
      head: new THREE.Bone(),
      upperArmL: new THREE.Bone(),
      lowerArmL: new THREE.Bone(),
      handL: new THREE.Bone(),
      upperArmR: new THREE.Bone(),
      lowerArmR: new THREE.Bone(),
      handR: new THREE.Bone(),
      upperLegL: new THREE.Bone(),
      lowerLegL: new THREE.Bone(),
      footL: new THREE.Bone(),
      upperLegR: new THREE.Bone(),
      lowerLegR: new THREE.Bone(),
      footR: new THREE.Bone()
    };
    var boneNames = {
      root: 'root',
      pelvis: 'pelvis',
      spine: 'spine',
      chest: 'chest',
      neck: 'neck',
      head: 'head',
      upperArmL: 'upper-arm-left',
      lowerArmL: 'lower-arm-left',
      handL: 'hand-left',
      upperArmR: 'upper-arm-right',
      lowerArmR: 'lower-arm-right',
      handR: 'hand-right',
      upperLegL: 'upper-leg-left',
      lowerLegL: 'lower-leg-left',
      footL: 'foot-left',
      upperLegR: 'upper-leg-right',
      lowerLegR: 'lower-leg-right',
      footR: 'foot-right'
    };
    Object.keys(boneNames).forEach(function (key) {
      bones[key].name = 'xiaohei-rig-' + boneNames[key];
    });

    bones.root.add(bones.pelvis);
    bones.pelvis.position.set(0, height * 0.285, 0);
    bones.pelvis.add(bones.spine, bones.upperLegL, bones.upperLegR);
    bones.spine.position.set(0, height * 0.105, 0);
    bones.spine.add(bones.chest);
    bones.chest.position.set(0, height * 0.135, 0);
    bones.chest.add(bones.neck, bones.upperArmL, bones.upperArmR);
    bones.neck.position.set(0, height * 0.080, 0);
    bones.neck.add(bones.head);
    bones.head.position.set(0, height * 0.055, 0);

    bones.upperArmL.position.set(-height * 0.095, height * 0.035, 0);
    bones.upperArmL.add(bones.lowerArmL);
    bones.lowerArmL.position.set(-height * 0.125, 0, 0);
    bones.lowerArmL.add(bones.handL);
    bones.handL.position.set(-height * 0.085, 0, 0);
    bones.upperArmR.position.set(height * 0.095, height * 0.035, 0);
    bones.upperArmR.add(bones.lowerArmR);
    bones.lowerArmR.position.set(height * 0.125, 0, 0);
    bones.lowerArmR.add(bones.handR);
    bones.handR.position.set(height * 0.085, 0, 0);

    bones.upperLegL.position.set(-height * 0.055, -height * 0.005, 0);
    bones.upperLegL.add(bones.lowerLegL);
    bones.lowerLegL.position.set(0, -height * 0.145, 0);
    bones.lowerLegL.add(bones.footL);
    bones.footL.position.set(0, -height * 0.115, height * 0.008);
    bones.upperLegR.position.set(height * 0.055, -height * 0.005, 0);
    bones.upperLegR.add(bones.lowerLegR);
    bones.lowerLegR.position.set(0, -height * 0.145, 0);
    bones.lowerLegR.add(bones.footR);
    bones.footR.position.set(0, -height * 0.115, height * 0.008);

    var ordered = [
      bones.root,
      bones.pelvis,
      bones.spine,
      bones.chest,
      bones.neck,
      bones.head,
      bones.upperArmL,
      bones.lowerArmL,
      bones.handL,
      bones.upperArmR,
      bones.lowerArmR,
      bones.handR,
      bones.upperLegL,
      bones.lowerLegL,
      bones.footL,
      bones.upperLegR,
      bones.lowerLegR,
      bones.footR
    ];
    var position = geometry.getAttribute('position');
    var skinIndex = new Uint16Array(position.count * 4);
    var skinWeight = new Float32Array(position.count * 4);

    function weightPair(vertex, firstIndex, firstWeight, secondIndex) {
      var offset = vertex * 4;
      var clamped = Math.max(0, Math.min(1, firstWeight));
      skinIndex[offset] = firstIndex;
      skinIndex[offset + 1] = secondIndex;
      skinWeight[offset] = clamped;
      skinWeight[offset + 1] = 1 - clamped;
    }

    for (var vertex = 0; vertex < position.count; vertex += 1) {
      var x = position.getX(vertex) / height;
      var y = position.getY(vertex) / height;
      var ax = Math.abs(x);
      var left = x < 0;

      var armMask = xiaoheiMotionSmoothstep(0.105, 0.155, ax)
        * xiaoheiMotionSmoothstep(0.515, 0.545, y)
        * (1 - xiaoheiMotionSmoothstep(0.615, 0.645, y));
      if (armMask > 0.06) {
        var upperArm = left ? 6 : 9;
        var lowerArm = left ? 7 : 10;
        var hand = left ? 8 : 11;
        if (ax < 0.190) {
          weightPair(vertex, upperArm, armMask, 3);
        } else if (ax < 0.270) {
          weightPair(vertex, lowerArm, xiaoheiMotionSmoothstep(0.205, 0.265, ax), upperArm);
        } else if (ax < 0.335) {
          weightPair(vertex, hand, xiaoheiMotionSmoothstep(0.292, 0.332, ax), lowerArm);
        } else {
          weightPair(vertex, hand, 1, lowerArm);
        }
        continue;
      }

      if (y >= 0.585) {
        var headWeight = xiaoheiMotionSmoothstep(0.595, 0.650, y);
        weightPair(vertex, 5, headWeight, 4);
        continue;
      }

      if (y < 0.285 && ax > 0.012) {
        var upperLeg = left ? 12 : 15;
        var lowerLeg = left ? 13 : 16;
        var foot = left ? 14 : 17;
        if (y < 0.080) {
          weightPair(vertex, foot, xiaoheiMotionSmoothstep(0.095, 0.055, y), lowerLeg);
        } else if (y < 0.190) {
          weightPair(vertex, lowerLeg, xiaoheiMotionSmoothstep(0.205, 0.155, y), upperLeg);
        } else {
          weightPair(vertex, upperLeg, xiaoheiMotionSmoothstep(0.245, 0.285, y), 1);
        }
        continue;
      }

      if (y >= 0.535) {
        weightPair(vertex, 4, xiaoheiMotionSmoothstep(0.545, 0.605, y), 3);
      } else if (y >= 0.420) {
        weightPair(vertex, 3, xiaoheiMotionSmoothstep(0.430, 0.515, y), 2);
      } else if (y >= 0.285) {
        weightPair(vertex, 2, xiaoheiMotionSmoothstep(0.300, 0.410, y), 1);
      } else {
        weightPair(vertex, 1, 1, 0);
      }
    }

    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
    return {
      rootBone: bones.root,
      skeleton: new THREE.Skeleton(ordered),
      bones: bones,
      rest: {
        pelvisY: bones.pelvis.position.y,
        spineY: bones.spine.position.y,
        chestY: bones.chest.position.y,
        neckY: bones.neck.position.y,
        headY: bones.head.position.y
      }
    };
  }

  function xiaoheiAvatarPrepareMotion(avatar) {
    avatar.motion = {
      action: 'idle',
      anchorT: 0.42
    };
  }

  function xiaoheiAvatarPoseMotion(avatar, now) {
    var motion = avatar.motion;
    var rig = avatar.rig;
    if (!motion || !rig) return;
    var bones = rig.bones;
    var rest = rig.rest;
    var seconds = now * 0.001;
    var breath = Math.sin(seconds * 1.45);
    var breathLift = Math.sin(seconds * 1.45 + 0.58);
    var sway = Math.sin(seconds * 0.56 + 0.7);
    var counterSway = Math.sin(seconds * 0.56 + 2.65);
    var gaze = xiaoheiAvatarHover;
    var pointerX = ndc.x <= 2 ? ndc.x : 0;
    var pointerY = ndc.y <= 2 ? ndc.y : 0;

    bones.pelvis.position.y = rest.pelvisY + breath * avatar.reviewedHeight * 0.0035;
    bones.spine.position.y = rest.spineY + breathLift * avatar.reviewedHeight * 0.0012;
    bones.chest.position.y = rest.chestY + breathLift * avatar.reviewedHeight * 0.0018;
    bones.neck.position.y = rest.neckY;
    bones.head.position.y = rest.headY;

    bones.pelvis.rotation.set(0, sway * 0.006, sway * 0.013);
    bones.spine.rotation.set(breath * 0.007, -sway * 0.010, -sway * 0.020);
    bones.chest.rotation.set(-breath * 0.009, sway * 0.014, sway * 0.014);
    bones.neck.rotation.set(-breath * 0.004, 0, -sway * 0.006);
    bones.head.rotation.set(
      (avatar.screenPitch || 0) + Math.sin(seconds * 0.78) * 0.020 - pointerY * gaze * 0.050,
      pointerX * gaze * 0.135 + counterSway * 0.014,
      sway * 0.026 - pointerX * gaze * 0.012
    );

    bones.upperArmL.rotation.set(
      breath * 0.012,
      -0.055 + sway * 0.010,
      1.44 + breath * 0.022 - gaze * 0.016
    );
    bones.lowerArmL.rotation.set(0, 0, 0.07 + breathLift * 0.016 + gaze * 0.012);
    bones.handL.rotation.set(0, -0.018, -0.055 + sway * 0.014);
    bones.upperArmR.rotation.set(
      -breath * 0.012,
      0.055 - sway * 0.010,
      -1.44 - breath * 0.022 + gaze * 0.016
    );
    bones.lowerArmR.rotation.set(0, 0, -0.07 - breathLift * 0.016 - gaze * 0.012);
    bones.handR.rotation.set(0, 0.018, 0.055 - sway * 0.014);

    bones.upperLegL.rotation.set(0, 0, sway * 0.004);
    bones.lowerLegL.rotation.set(0, 0, 0);
    bones.footL.rotation.set(0, 0, 0);
    bones.upperLegR.rotation.set(0, 0, -sway * 0.004);
    bones.lowerLegR.rotation.set(0, 0, 0);
    bones.footR.rotation.set(0, 0, 0);

    avatar.model.position.y = breath * avatar.reviewedHeight * 0.0018;
    avatar.model.scale.set(1, 1, 1);
  }
`
